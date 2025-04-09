import {Resource} from "store/resource/Resource.svelte.js";
import PodsLite from "components/PodsLite.svelte";
import Table from "components/Table.svelte";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import ResourceEvents from "components/resource/ResourceEvents.svelte";
import DeploymentDetailComponent from "components/detail/component/DeploymentDetailComponent.svelte";
import Metadata from "components/form/resource/Metadata.svelte";
import ResourceInput from "components/form/resource/ResourceInput.svelte";
import Strategy from "components/form/resource/Strategy.svelte";
import Selector from "components/form/resource/Selector.svelte";
import MetadataLite from "components/form/resource/MetadataLite.svelte";
import Containers from "components/form/resource/Containers.svelte";
import InitContainers from "components/form/resource/InitContainers.svelte";
import Volume from "components/form/resource/Volume.svelte";
import ImagePullSecrets from "components/form/resource/ImagePullSecrets.svelte";
import ServiceAccountSelect from "components/form/resource/ServiceAccountSelect.svelte";
import BooleanField from "components/form/resource/BooleanField.svelte";
import NodeSelector from "components/form/resource/NodeSelector.svelte";
import Affinity from "components/form/resource/Affinity.svelte";
import Toleration from "components/form/resource/Toleration.svelte";
import DnsPolicy from "components/form/resource/DnsPolicy.svelte";
import DnsConfig from "components/form/resource/DnsConfig.svelte";
import RestartPolicy from "components/form/resource/RestartPolicy.svelte";
import PauseIcon from "components/icons/PauseIcon.svelte";
import ResumeIcon from "components/icons/ResumeIcon.svelte";

export class Deployment extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.Pod, this.resources.ReplicaSet];
    }

    _getPublicEndpoints(annotations) {
        if (!annotations["field.cattle.io/publicEndpoints"]) {
            return [];
        }
        try {
            return JSON.parse(annotations["field.cattle.io/publicEndpoints"]);
        } catch (e) {
            return [];
        }
    }

    getStatus() {
        const deployment = this.raw;
        const pods = this.resources.Pod.getRawByLabels(deployment.spec.selector.matchLabels);
        const replicaSets = this.resources.ReplicaSet.getRawByLabels(deployment.spec.selector.matchLabels);
        const conditions = deployment.status?.conditions || [];
        const specReplicas = deployment.spec.replicas || 0;
        const readyReplicas = deployment.status?.readyReplicas || 0;
        const availableReplicas = deployment.status?.availableReplicas || 0;
        const unavailableReplicas = deployment.status?.unavailableReplicas || 0;

        const statusChecks = [
            checkTerminating,
            checkPaused,
            checkFailed,
            checkReplicaFailure,
            checkDegraded,
            checkUpgrading,
            checkProgressing,
            checkScaling,
            checkWaiting,
            checkAvailable,
            checkActive,
            checkUnknown
        ];

        const podStatuses = pods.map(pod => this.resources.Pod.getHandler(pod).getStatus());
        const runningPods = podStatuses.filter(s => s.status === 'Running').length;
        const podStatusMap = {};
        podStatuses.forEach(a => {
            if (!podStatusMap[a.status]) {
                podStatusMap[a.status] = {size: 0, total: podStatuses.length, status: a.status, raw: a};
            }
            podStatusMap[a.status].size += 1;
        });
        const podStatusList = Reflect.ownKeys(podStatusMap).map(a => {
            return {
                size: podStatusMap[a].size,
                total: podStatusMap[a].total,
                status: podStatusMap[a].status,
                className: podStatusMap[a].raw.className,
                sort: podStatusMap[a].raw.sort,
                ratio: Math.round(podStatusMap[a].size / podStatusMap[a].total * 100)
            };
        }).sort((a, b) => {
            return b.sort - a.sort;
        });
        const podReadyRatio = pods.length > 0 ? Math.round(runningPods / pods.length * 100) : 0;

        for (const check of statusChecks) {
            const result = check();
            if (result) return result;
        }

        return defaultStatus();

        function checkTerminating() {
            if (deployment.metadata.deletionTimestamp) {
                return buildStatus(
                    'Terminating',
                    'terminating',
                    `Deployment is being deleted (started at ${deployment.metadata.deletionTimestamp}).`
                );
            }
            if (pods.some(pod => pod.metadata?.deletionTimestamp)) {
                return buildStatus(
                    'Terminating',
                    'terminating',
                    'One or more Pods are in termination phase.'
                );
            }
        }

        function checkPaused() {
            if (deployment.spec.paused) {
                return buildStatus(
                    'Paused',
                    'paused',
                    'Deployment updates are paused. Use "kubectl rollout resume" to continue.'
                );
            }
        }

        function checkFailed() {
            const failedPods = pods.filter(pod =>
                pod.status?.containerStatuses?.some(cs => {
                    return cs.state?.waiting?.reason === 'CrashLoopBackOff' || (cs.state?.terminated?.exitCode && cs.state?.terminated?.exitCode !== 0);
                })
            );
            if (failedPods.length > 0) {
                const examples = failedPods.slice(0, 3).map(pod => pod.metadata.name);
                return buildStatus(
                    'Failed',
                    'failed',
                    `Critical failure in Pod(s): ${examples.join(', ')}. ` +
                    'Check application logs for crashes or configuration errors.'
                );
            }
        }

        function checkReplicaFailure() {
            const replicaSetErrors = replicaSets.filter(rs =>
                rs.status?.conditions?.some(c =>
                    c.type === 'ReplicaFailure' && c.status === 'True'
                )
            );

            if (replicaSetErrors.length > 0) {
                const reasons = replicaSetErrors.flatMap(rs =>
                    rs.status.conditions.map(c => c.message)
                );
                return buildStatus(
                    'ReplicaFailure',
                    'replica-failure',
                    `ReplicaSet errors detected: ${reasons.join('; ')}. ` +
                    'Possible causes: resource limits, image pull errors, or storage issues.'
                );
            }
        }

        function checkDegraded() {
            if (readyReplicas < specReplicas && readyReplicas > 0) {
                return buildStatus(
                    'Degraded',
                    'degraded',
                    `${specReplicas - readyReplicas} replica(s) are not ready. ` +
                    'Partial availability - check Pod network policies or intermittent failures.'
                );
            }
        }

        function checkUpgrading() {
            const newRS = replicaSets.find(rs => rs.metadata?.annotations &&
                rs.metadata?.annotations['deployment.kubernetes.io/revision'] !==
                deployment.metadata?.annotations['deployment.kubernetes.io/revision']
            );

            if (newRS && pods.some(pod => pod.metadata?.deletionTimestamp)) {
                return buildStatus(
                    'Upgrading',
                    'upgrading',
                    `Rolling update in progress: ${newRS.metadata.name} is replacing old Pods.`
                );
            }
        }

        function checkProgressing() {
            const progressingCondition = conditions.find(c => c.type === 'Progressing');
            if (progressingCondition?.status === 'True' &&
                progressingCondition.reason === 'ReplicaSetUpdated') {
                return buildStatus(
                    'Progressing',
                    'progressing',
                    `Deployment is updating: ${progressingCondition.message}`
                );
            }
        }

        function checkScaling() {
            const hpaEvent = pods.find(pod =>
                pod.metadata.annotations?.['autoscaling.alpha.kubernetes.io/conditions']
            );

            if ((deployment.status?.replicas && specReplicas !== deployment.status?.replicas) || hpaEvent) {
                return buildStatus(
                    'Scaling',
                    'scaling',
                    `Replica count changing from ${deployment.status?.replicas} to ${specReplicas}. ` +
                    (hpaEvent ? 'Triggered by Horizontal Pod Autoscaler.' : '')
                );
            }
        }

        function checkWaiting() {
            const waitingPods = pods.filter(pod =>
                pod.status?.containerStatuses?.some(cs =>
                    cs.state?.waiting &&
                    ['ContainerCreating', 'ImagePullBackOff', 'CrashLoopBackOff'].includes(cs.state.waiting.reason)
                )
            );
            if (waitingPods.length > 0) {
                const reasons = waitingPods.flatMap(pod =>
                    pod.status.containerStatuses.map(cs => cs.state.waiting?.reason)
                );
                return buildStatus(
                    'Waiting',
                    'waiting',
                    `Pods waiting: ${[...new Set(reasons)].join(', ')}. ` +
                    'Check image availability or resource allocation.'
                );
            }
        }

        function checkAvailable() {
            if (availableReplicas >= deployment.spec.minReadySeconds || 0) {
                return buildStatus(
                    'Available',
                    'available',
                    `Minimum availability (${deployment.spec.minReadySeconds}s) satisfied with ${availableReplicas} Pods.`
                );
            }
        }

        function checkActive() {
            if (readyReplicas === specReplicas && unavailableReplicas === 0) {
                return buildStatus(
                    'Active',
                    'active',
                    `All ${specReplicas} replica(s) are running and ready.`
                );
            }
        }

        function checkUnknown() {
            if (!deployment.status || !conditions.length) {
                return buildStatus(
                    'Unknown',
                    'unknown',
                    'Deployment status cannot be determined. Check cluster connectivity.'
                );
            }
        }

        function defaultStatus() {
            return buildStatus(
                'Unknown',
                'unknown',
                'Unexpected state - no matching condition found.'
            );
        }

        function buildStatus(status, className, message) {
            return {
                status,
                className: `status-${className}`,
                message,
                podStatusList,
                podReadyRatio
            };
        }
    }

    getPodsStatusStatistics() {
        let r = {};
        let pods = this.resources.Pod.getByLabels(this.getMatchLabels());
        pods.forEach(pod => {
            let {status} = pod.getStatus();
            if (!r[status]) {
                r[status] = 0;
            }
            r[status] = r[status] + 1;
        });
        return Reflect.ownKeys(r).map(state => {
            return {
                state,
                total: pods.length,
                size: r[state],
                className: `status-${state.toLowerCase()}`,
                percent: Math.round(r[state] / pods.length * 100)
            };
        });
    }

    getTableRow() {
        let deployment = this.raw;
        const metadata = deployment.metadata || {};
        const spec = deployment.spec || {};
        const status = deployment.status || {};

        let item = {
            id: metadata.name,
            name: metadata.name || "",
            namespace: metadata.namespace || "",
            image: spec.template?.spec?.containers?.[0]?.image || "",
            replicas: spec.replicas || 0,
            availableReplicas: status.availableReplicas || 0,
            status: this.getStatus(deployment),
            creationTimestamp: metadata.creationTimestamp || "",
            publicEndpoints: this._getPublicEndpoints(metadata.annotations || {}),
            age: this.age
        };
        item.ready = `${item.availableReplicas}/${item.replicas}`;
        if (item.status.status !== 'Active' && item.status.message) {
            item.rowOption = {className: 'row-desc'};
            item.status.showDescription = true;
        }
        return item;
    }

    getTableHeader() {
        return [
            {name: "State", key: "status", align: "left", width: "100px"},
            {name: "Name", key: "name", align: "left", width: "130px", sortable: true, sorted: "asc"},
            {name: "Namespace", key: "namespace", align: "left", width: "100px"},
            {name: "Image", key: "image", align: "left"},
            {name: "Endpoints", key: "publicEndpoints", align: "left", width: "110px"},
            {name: "Ready", key: "ready", align: "center", width: "100px"},
            {name: "Available", key: "availableReplicas", align: "center", width: "80px", sortable: true},
            {name: "Age", key: "age", align: "center", width: "80px", sortable: true},
            {name: "Health", key: "health", align: "center", width: "150px"}
        ];
    }

    getActions() {
        return [
            'Detail',
            'Yaml',
            'Config',
            'EditConfig',
            'EditYaml',
            'Clone',
            'Download',
            "Redeploy",
            'ExecuteShell',
            'Rollback',
            'Orchestration',
            'Delete'
        ];
    }

    onShowTableMenu(menus, name) {
        let resource = this.getResource(name);
        let target = menus.find(a => a.typeName === 'Orchestration');
        if (!target) {
            return;
        }
        if (resource) {
            if (resource.spec?.paused) {
                target.label = "Resume Orchestration";
                target.icon = ResumeIcon;
                target.action = (name) => {
                    this.resumeOrchestration(name);
                }
            } else {
                target.label = "Pause Orchestration";
                target.icon = PauseIcon;
                target.action = (name) => {
                    this.pauseOrchestration(name);
                }
            }
        }
    }

    onShowDropMenu(menus, deployment) {
        this.onShowTableMenu(menus, deployment.metadata.name);
    }

    getIntro(deployment) {
        return [
            {key: "Image", value: deployment.metadata.namespace}
        ];
    }

    getDetailTabs(deployment) {
        return [
            {
                id: "pods",
                title: "Pods",
                component: PodsLite,
                params: {
                    params: {
                        matchLabels: deployment.spec.selector?.matchLabels
                    }
                }
            },
            {
                id: "conditions",
                title: "Conditions",
                component: Table,
                params: {
                    header: [
                        {name: "Condition", key: "type", align: "left"},
                        {name: "Status", key: "status", align: "left"},
                        {name: "Updated", key: "lastUpdateTime", align: "left"},
                        {name: "Message", key: "message", align: "left"}
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: deployment.status.conditions || []
                }
            },
            {
                id: "refers",
                title: "Related Resources",
                component: ResourceRefers,
                params: {
                    name: deployment.metadata.name,
                    namespace: deployment.metadata.namespace,
                    kind: deployment.kind,
                }
            },
            {
                id: "events",
                title: "Events",
                component: ResourceEvents,
                params: {
                    name: deployment.metadata.name,
                    namespace: deployment.metadata.namespace,
                    kind: deployment.kind,
                }
            }
        ]
    }

    getDetailComponents(resourceKind) {
        return [
            {
                component: DeploymentDetailComponent,
                params: {
                    deployment: resourceKind
                }
            }
        ];
    }

    getFormDefinition() {
        return [
            {
                name: "metadata",
                component: Metadata,
                key: "metadata",
                option: {label: 'metadata'},
            },
            {
                name: "spec", component: null, key: "spec", children: [
                    {
                        name: "replicas",
                        component: ResourceInput,
                        option: {label: 'replicas', type: "number"},
                        key: "spec.replicas",
                    },
                    {name: "strategy", component: Strategy, key: "spec.strategy"},
                    {name: "selector", component: Selector, key: "spec.selector"},
                    {
                        name: "template", component: null, key: "spec.template", children: [
                            {
                                name: "metadata",
                                component: MetadataLite,
                                key: "spec.template.metadata",
                            },
                            {
                                name: "spec", component: null, key: "spec.template.spec", children: [
                                    {
                                        name: "containers",
                                        component: Containers,
                                        key: "spec.template.spec.containers",
                                        defaultValue() {
                                            return [];
                                        }
                                    },
                                    {
                                        name: "initContainers",
                                        component: InitContainers,
                                        key: "spec.template.spec.initContainers",
                                        defaultValue() {
                                            return [];
                                        }
                                    },
                                    {
                                        name: "volumes",
                                        component: Volume,
                                        key: "spec.template.spec.volumes",
                                        defaultValue() {
                                            return [];
                                        }
                                    },
                                    {
                                        name: "imagePullSecrets",
                                        component: ImagePullSecrets,
                                        key: "spec.template.spec.imagePullSecrets"
                                    },
                                    {
                                        name: "serviceAccountName",
                                        component: ServiceAccountSelect,
                                        key: "spec.template.spec.serviceAccountName"
                                    },
                                    {
                                        name: "automountServiceAccountToken",
                                        component: BooleanField,
                                        option: {label: 'automountServiceAccountToken'},
                                        key: "spec.template.spec.automountServiceAccountToken"
                                    },
                                    {
                                        name: "nodeSelector",
                                        component: NodeSelector,
                                        key: "spec.template.spec.nodeSelector"
                                    },
                                    {name: "affinity", component: Affinity, key: "spec.template.spec.affinity"},
                                    {name: "tolerations", component: Toleration, key: "spec.template.spec.tolerations"},
                                    {name: "dnsPolicy", component: DnsPolicy, key: "spec.template.spec.dnsPolicy"},
                                    {name: "dnsConfig", component: DnsConfig, key: "spec.template.spec.dnsConfig"},
                                    {
                                        name: "hostNetwork",
                                        component: BooleanField,
                                        option: {label: 'hostNetwork'},
                                        key: "spec.template.spec.hostNetwork"
                                    },
                                    {
                                        name: "hostPID",
                                        component: BooleanField,
                                        option: {label: 'hostPID'},
                                        key: "spec.template.spec.hostPID"
                                    },
                                    {
                                        name: "hostIPC",
                                        component: BooleanField,
                                        option: {label: 'hostIPC'},
                                        key: "spec.template.spec.hostIPC"
                                    },
                                    {
                                        name: "restartPolicy",
                                        component: RestartPolicy,
                                        key: "spec.template.spec.restartPolicy"
                                    },
                                ]
                            }
                        ]
                    }
                ]
            },
        ];
    }
}