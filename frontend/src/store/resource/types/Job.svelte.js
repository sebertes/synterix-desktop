import {Deployment} from "store/resource/types/Deployment.svelte.js";
import Metadata from "components/form/resource/Metadata.svelte";
import ResourceInput from "components/form/resource/ResourceInput.svelte";
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

export class Job extends Deployment {
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
            completions: spec.completions || 0,
            parallelism: spec.parallelism || 0,
            status: this.getStatus(deployment),
            duration: ((new Date(status.completionTime) - new Date(status.startTime)) / 1000) + 's',
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
            {name: "Completions", key: "completions", align: "center", width: "100px"},
            {name: "Duration", key: "duration", align: "center", width: "80px", sortable: true},
            {name: "Age", key: "age", align: "center", width: "80px", sortable: true},
            {name: "Health", key: "health", align: "center", width: "150px"}
        ];
    }

    getActions() {
        return [
            'Detail',
            'Yaml',
            'Config',
            'ViewYaml',
            'ViewConfig',
            'Clone',
            'Download',
            'ExecuteShell',
            'Delete'
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
                        name: "completions",
                        component: ResourceInput,
                        option: {label: 'completions', type: "number"},
                        key: "spec.completions",
                    },
                    {
                        name: "parallelism",
                        component: ResourceInput,
                        option: {label: 'parallelism', type: "number"},
                        key: "spec.parallelism",
                    },
                    {
                        name: "backoffLimit",
                        component: ResourceInput,
                        option: {label: 'backoffLimit', type: "number"},
                        key: "spec.backoffLimit",
                    },
                    {
                        name: "activeDeadlineSeconds",
                        component: ResourceInput,
                        option: {label: 'activeDeadlineSeconds', type: "number"},
                        key: "spec.activeDeadlineSeconds",
                    },
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