import PodsLite from "components/PodsLite.svelte";
import Table from "components/Table.svelte";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import Metadata from "components/form/resource/Metadata.svelte";
import ResourceInput from "components/form/resource/ResourceInput.svelte";
import Selector from "components/form/resource/Selector.svelte";
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
import ResourceSelect from "components/form/resource/ResourceSelect.svelte";
import {Deployment} from "store/resource/types/Deployment.svelte.js";

export class CronJob extends Deployment {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
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
            schedule: spec.schedule || "",
            lastSchedule: spec.status.lastScheduleTime || "",
            parallelism: spec.parallelism || 0,
            status: this.getStatus(deployment),
            creationTimestamp: metadata.creationTimestamp || "",
            publicEndpoints: this._getPublicEndpoints(metadata.annotations || {}),
            age: this.age
        };
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
            {name: "Schedule", key: "schedule", align: "center", width: "100px"},
            {name: "Last Schedule", key: "lastSchedule", align: "center", width: "80px", sortable: true},
            {name: "Age", key: "age", align: "center", width: "80px", sortable: true},
            {name: "Health", key: "health", align: "center", width: "150px"}
        ];
    }

    getIntro(resource) {
        return [];
    }

    getDetailTabs(resource) {
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
        ]
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
                        name: "schedule",
                        component: ResourceInput,
                        option: {label: 'schedule', type: "text"},
                        key: "spec.schedule",
                    },
                    {
                        name: "concurrencyPolicy",
                        component: ResourceSelect,
                        option: {
                            label: 'concurrencyPolicy',
                            options: [
                                {name: "Allow", value: "Allow"},
                                {name: "Forbid", value: "Forbid"},
                                {name: "Replace", value: "Replace"}
                            ]
                        },
                        key: "spec.concurrencyPolicy",
                    },
                    {
                        name: "successfulJobsHistoryLimit",
                        component: ResourceInput,
                        option: {label: 'successfulJobsHistoryLimit', type: "number"},
                        key: "spec.successfulJobsHistoryLimit",
                    },
                    {
                        name: "startingDeadlineSeconds",
                        component: ResourceInput,
                        option: {label: 'startingDeadlineSeconds', type: "number"},
                        key: "spec.startingDeadlineSeconds",
                    },
                    {
                        name: "failedJobsHistoryLimit",
                        component: ResourceInput,
                        option: {label: 'failedJobsHistoryLimit', type: "number"},
                        key: "spec.failedJobsHistoryLimit",
                    },
                    {
                        name: "timeZone",
                        component: ResourceInput,
                        option: {label: 'timeZone', type: "text"},
                        key: "spec.timeZone",
                    },
                    {
                        name: "selector", component: Selector, key: "spec.selector", defaultValue() {
                            return {
                                matchLabels: {},
                                matchExpressions: []
                            };
                        }
                    },
                    {
                        name: "jobTemplate", key: "spec.jobTemplate", children: [
                            {
                                name: "spec", key: "spec.jobTemplate.spec", children: [
                                    {
                                        name: "template",
                                        component: null,
                                        key: "spec.jobTemplate.spec.template",
                                        children: [
                                            {
                                                name: "spec",
                                                component: null,
                                                key: "spec.jobTemplate.spec.template.spec",
                                                children: [
                                                    {
                                                        name: "containers",
                                                        component: Containers,
                                                        key: "spec.jobTemplate.spec.template.spec.containers",
                                                        defaultValue() {
                                                            return [];
                                                        }
                                                    },
                                                    {
                                                        name: "initContainers",
                                                        component: InitContainers,
                                                        key: "spec.jobTemplate.spec.template.spec.initContainers",
                                                        defaultValue() {
                                                            return [];
                                                        }
                                                    },
                                                    {
                                                        name: "volumes",
                                                        component: Volume,
                                                        key: "spec.jobTemplate.spec.template.spec.volumes",
                                                        defaultValue() {
                                                            return [];
                                                        }
                                                    },
                                                    {
                                                        name: "imagePullSecrets",
                                                        component: ImagePullSecrets,
                                                        key: "spec.jobTemplate.spec.template.spec.imagePullSecrets"
                                                    },
                                                    {
                                                        name: "serviceAccountName",
                                                        component: ServiceAccountSelect,
                                                        key: "spec.jobTemplate.spec.template.spec.serviceAccountName"
                                                    },
                                                    {
                                                        name: "automountServiceAccountToken",
                                                        component: BooleanField,
                                                        option: {label: 'automountServiceAccountToken'},
                                                        key: "spec.jobTemplate.spec.template.spec.automountServiceAccountToken"
                                                    },
                                                    {
                                                        name: "nodeSelector",
                                                        component: NodeSelector,
                                                        key: "spec.jobTemplate.spec.template.spec.nodeSelector"
                                                    },
                                                    {
                                                        name: "affinity",
                                                        component: Affinity,
                                                        key: "spec.jobTemplate.spec.template.spec.affinity"
                                                    },
                                                    {
                                                        name: "tolerations",
                                                        component: Toleration,
                                                        key: "spec.jobTemplate.spec.template.spec.tolerations"
                                                    },
                                                    {
                                                        name: "dnsPolicy",
                                                        component: DnsPolicy,
                                                        key: "spec.jobTemplate.spec.template.spec.dnsPolicy"
                                                    },
                                                    {
                                                        name: "dnsConfig",
                                                        component: DnsConfig,
                                                        key: "spec.jobTemplate.spec.template.spec.dnsConfig"
                                                    },
                                                    {
                                                        name: "hostNetwork",
                                                        component: BooleanField,
                                                        option: {label: 'hostNetwork'},
                                                        key: "spec.jobTemplate.spec.template.spec.hostNetwork"
                                                    },
                                                    {
                                                        name: "hostPID",
                                                        component: BooleanField,
                                                        option: {label: 'hostPID'},
                                                        key: "spec.jobTemplate.spec.template.spec.hostPID"
                                                    },
                                                    {
                                                        name: "hostIPC",
                                                        component: BooleanField,
                                                        option: {label: 'hostIPC'},
                                                        key: "spec.jobTemplate.spec.template.spec.hostIPC"
                                                    },
                                                    {
                                                        name: "restartPolicy",
                                                        component: RestartPolicy,
                                                        key: "spec.jobTemplate.spec.template.spec.restartPolicy"
                                                    },
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
        ];
    }
}