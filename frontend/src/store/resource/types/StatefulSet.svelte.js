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
import HeadlessSelect from "components/form/resource/HeadlessSelect.svelte";
import UpdateStrategy from "components/form/resource/UpdateStrategy.svelte";
import PodManagementPolicy from "components/form/resource/PodManagementPolicy.svelte";
import VolumeClaimTemplates from "components/form/resource/VolumeClaimTemplates.svelte";

export class StatefulSet extends Deployment {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
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
                    {name: "serviceName", component: HeadlessSelect, key: "spec.serviceName"},
                    {name: "selector", component: Selector, key: "spec.selector"},
                    {name: "podManagementPolicy", component: PodManagementPolicy, key: "spec.podManagementPolicy"},
                    {name: "updateStrategy", component: UpdateStrategy, key: "spec.updateStrategy"},
                    {
                        name: "volumeClaimTemplates",
                        component: VolumeClaimTemplates,
                        key: "spec.volumeClaimTemplates",
                        defaultValue() {
                            return [];
                        }
                    },
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