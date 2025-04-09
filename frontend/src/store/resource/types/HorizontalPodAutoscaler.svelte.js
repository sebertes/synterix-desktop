import {Resource} from "store/resource/Resource.svelte.js";
import PodsLite from "components/PodsLite.svelte";
import Table from "components/Table.svelte";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import Metadata from "components/form/resource/Metadata.svelte";
import ResourceInput from "components/form/resource/ResourceInput.svelte";
import ScaleTargetRef from "components/form/ScaleTargetRef.svelte";
import HPAMetrics from "components/form/resource/HPAMetrics.svelte";

export class HorizontalPodAutoscaler extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [
            this.resources.Deployment,
            this.resources.StatefulSet,
            this.resources.DaemonSet,
            this.resources.Job,
            this.resources.CronJob
        ];
    }

    getStatus() {
        let hpa = this.raw;
        let targetWorkload = [];
        this.resources.Deployment.getAllRawList().filter(a => {
            if (a.spec.selector.matchLabels.app === hpa.spec.scaleTargetRef.name) {
                targetWorkload.push(a);
            }
        });
        this.resources.StatefulSet.getAllRawList().filter(a => {
            if (a.spec.selector.matchLabels.app === hpa.spec.scaleTargetRef.name) {
                targetWorkload.push(a);
            }
        });
        this.resources.DaemonSet.getAllRawList().filter(a => {
            if (a.spec.selector.matchLabels.app === hpa.spec.scaleTargetRef.name) {
                targetWorkload.push(a);
            }
        });
        this.resources.Job.getAllRawList().filter(a => {
            if (a.spec.selector.matchLabels.app === hpa.spec.scaleTargetRef.name) {
                targetWorkload.push(a);
            }
        });
        this.resources.CronJob.getAllRawList().filter(a => {
            if (a.spec.selector.matchLabels.app === hpa.spec.scaleTargetRef.name) {
                targetWorkload.push(a);
            }
        });
        let isMetricsAvailable = true;
        const statusChecks = [
            {
                condition: () => {
                    const isConditionFailed = hpa.status?.conditions?.some(c =>
                        c.type === 'Failed' && c.status === 'True'
                    );
                    const isTargetMissing = !targetWorkload;
                    return isConditionFailed || isTargetMissing;
                },
                result: {
                    status: 'Failed',
                    className: 'status-failed',
                    message: `HPA 扩缩容失败。${
                        !targetWorkload ? `目标工作负载 ${hpa.spec.scaleTargetRef?.kind}/${hpa.spec.scaleTargetRef?.name} 不存在。` :
                            hpa.status?.conditions?.find(c => c.type === 'Failed')?.message ||
                            '可能原因：无法获取指标、达到最大/最小副本数限制。'
                    }`
                }
            },
            {
                condition: () =>
                    hpa.spec?.minReplicas === hpa.spec?.maxReplicas,
                result: {
                    status: 'Disabled',
                    className: 'status-disabled',
                    message: `HPA 未启用自动扩缩容（minReplicas == maxReplicas == ${hpa.spec.minReplicas}）。`
                }
            },
            {
                condition: () =>
                    hpa.status?.currentReplicas !== hpa.status?.desiredReplicas,
                result: {
                    status: 'Scaling',
                    className: 'status-scaling',
                    message: `HPA 正在调整副本数量：从 ${hpa.status.currentReplicas} 到 ${hpa.status.desiredReplicas}。${
                        targetWorkload ? `目标 ${targetWorkload.kind}/${targetWorkload?.metadata?.name} 当前副本：${targetWorkload.status?.replicas || 0}` : ''
                    }`
                }
            },
            {
                condition: () =>
                    isMetricsAvailable &&
                    hpa.status?.currentReplicas === hpa.status?.desiredReplicas,
                result: {
                    status: 'Active',
                    className: 'status-active',
                    message: `HPA 正常运行中。当前副本数：${hpa.status.currentReplicas}，目标指标：${
                        hpa.spec?.metrics?.map(m => m.type + '/' + (m.resource?.name || m.object?.metric?.name)).join(', ')
                    }${
                        targetWorkload ? `，关联工作负载：${targetWorkload?.kind}/${targetWorkload?.metadata?.name}` : ''
                    }`
                }
            },
            {
                condition: () => !isMetricsAvailable,
                result: {
                    status: 'Inactive',
                    className: 'status-inactive',
                    message: 'HPA 无法获取监控指标，自动扩缩容已暂停。请检查 Metrics Server 或自定义指标适配器。'
                }
            }
        ];

        return statusChecks.find(check => check.condition()).result;
    }

    getTableRow() {
        let service = this.raw;
        let a = {
            id: service.metadata.name,
            status: this.getStatus(),
            name: service.metadata.name,
            namespace: service.metadata.namespace,
            workload: service.spec.scaleTargetRef?.name,
            minimumReplicas: service.spec.minReplicas,
            maximumReplicas: service.spec.maxReplicas,
            currentReplicas: service.status.currentReplicas,
            age: this.age
        };
        if (a.status.status !== 'Active' && a.status.message) {
            a.rowOption = {className: 'row-desc'};
            a.status.showDescription = true;
        }
        return a;
    }

    getTableHeader() {
        return [
            {name: "State", key: "status", align: "left", width: "100px"},
            {name: "Name", key: "name", align: "left", width: "200px", sortable: true, sorted: "asc"},
            {name: "Namespace", key: "namespace", align: "left", width: "100px"},
            {name: "Workload", key: "workload", align: "left", width: "150px"},
            {name: "Minimum Replicas", key: "minimumReplicas", align: "center", sortable: true},
            {name: "Maximum Replicas", key: "maximumReplicas", align: "center", sortable: true},
            {name: "Current Replicas ", key: "currentReplicas", align: "center", sortable: true},
            {name: "Age", key: "age", align: 'center', width: "100px"}
        ];
    }

    getIntro(resource) {
        return [
            {key: "Type", value: resource.spec.type},
            {key: "Cluster IP:", value: resource.spec.clusterIP},
            {key: "Session Affinity", value: resource.spec.sessionAffinity},
        ];
    }

    getDetailTabs(service) {
        return [
            {
                id: "pods",
                title: "Pods",
                component: PodsLite,
                params: {
                    params: {
                        matchLabels: service.spec.selector
                    }
                }
            },
            {
                id: "ports",
                title: "Ports",
                component: Table,
                params: {
                    header: [
                        {name: "Name", key: "name", align: "left"},
                        {name: "Port", key: "port", align: "left"},
                        {name: "Protocol", key: "protocol", align: "left"},
                        {name: "Target", key: "targetPort", align: "left"}
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: service.spec.ports || []
                }
            },
            {
                id: "selector",
                title: "Selectors",
                component: Table,
                params: {
                    header: [
                        {name: "Key", key: "key", align: "left"},
                        {name: "Value", key: "value", align: "left"}
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: Reflect.ownKeys(service.spec.selector).map(a => {
                        return {
                            key: a,
                            value: service.spec.selector[a]
                        }
                    })
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
                        {name: "Updated", key: "lastTransitionTime", align: "left"},
                        {name: "Message", key: "message", align: "left"}
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: service.status.conditions || []
                }
            },
            {
                id: "refers",
                title: "Related Resources",
                component: ResourceRefers,
                params: {
                    name: service.metadata.name,
                    namespace: service.metadata.namespace,
                    kind: service.kind,
                }
            }
        ];
    }

    getDetailComponents(resourceKind) {
        return [];
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
                        name: "scaleTargetRef",
                        component: ScaleTargetRef,
                        key: "spec.scaleTargetRef",
                    },
                    {
                        name: "minReplicas",
                        component: ResourceInput,
                        option: {label: 'minReplicas', type: "number"},
                        key: "spec.minReplicas",
                    },
                    {
                        name: "maxReplicas",
                        component: ResourceInput,
                        option: {label: 'maxReplicas', type: "number"},
                        key: "spec.maxReplicas",
                    },
                    {
                        name: "metrics",
                        component: HPAMetrics,
                        key: "spec.metrics",
                    },
                ]
            },
        ];
    }
}