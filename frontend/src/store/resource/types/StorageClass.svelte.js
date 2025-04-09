import {Resource} from "store/resource/Resource.svelte.js";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import Metadata from "components/form/resource/Metadata.svelte";
import ResourceInput from "components/form/resource/ResourceInput.svelte";
import ResourceSelect from "components/form/resource/ResourceSelect.svelte";
import BooleanField from "components/form/resource/BooleanField.svelte";
import ResourceKeyValue from "components/form/resource/ResourceKeyValue.svelte";
import StringArray from "components/form/resource/StringArray.svelte";

export class StorageClass extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.PersistentVolumeClaim];
    }

    getStatus() {
        let storageClass = this.raw;
        let pvs = this.resources.PersistentVolumeClaim.getAllRawList().filter(a => {
            return a.spec.storageClassName === storageClass.metadata.name;
        });
        let pvcs = [];
        const statusChecks = [
            {
                condition: () => pvcs.length > 0 || pvs.length > 0,
                result: {
                    status: 'Active',
                    className: 'status-active',
                    description: `StorageClass 正在被 ${pvcs.length} 个 PVC 和 ${pvs.length} 个 PV 使用。Provisioner：${storageClass.provisioner}。`
                }
            },
            {
                condition: () => true,
                result: {
                    status: 'Active',
                    className: 'status-active',
                    description: `StorageClass 可用但未被任何 PVC/PV 使用。Provisioner：${storageClass.provisioner}。`
                }
            }
        ];
        return statusChecks.find(check => check.condition()).result;
    }

    getTableRow() {
        let deployment = this.raw;
        const metadata = deployment.metadata || {};
        const spec = deployment.spec || {};

        let item = {
            id: metadata.name,
            name: metadata.name || "",
            status: this.getStatus(deployment),
            provisioner: deployment.provisioner,
            default: metadata.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true',
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
            {name: "Name", key: "name", align: "left", sortable: true, sorted: "asc"},
            {name: "Provisioner ", key: "provisioner", align: "left"},
            {name: "Default ", key: "default", align: "left"},
            {name: "Age", key: "age", align: "center", width: "80px", sortable: true},
        ];
    }

    getIntro(deployment) {
        return [];
    }

    getDetailTabs(configmap) {
        return [
            // {
            //     id: "data",
            //     title: "Data",
            //     component: ConfigmapData,
            //     params: {
            //         configmap
            //     }
            // },
            {
                id: "refers",
                title: "Related Resources",
                component: ResourceRefers,
                params: {
                    name: configmap.metadata.name,
                    namespace: configmap.metadata.namespace,
                    kind: configmap.kind,
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
            {name: "provisioner", component: ResourceInput, option: {label: "provisioner"}, key: "provisioner"},
            {
                name: "reclaimPolicy",
                component: ResourceSelect,
                option: {
                    label: "reclaimPolicy",
                    options: [
                        {name: "Delete", value: "Delete"},
                        {name: "Retain", value: "Retain"},
                    ]
                },
                key: "reclaimPolicy"
            },
            {
                name: "allowVolumeExpansion",
                component: BooleanField,
                option: {label: 'allowVolumeExpansion'},
                key: "allowVolumeExpansion"
            },
            {
                name: "volumeBindingMode",
                component: ResourceSelect,
                option: {
                    label: "volumeBindingMode",
                    options: [
                        {name: "Immediate", value: "Immediate"},
                        {name: "WaitForFirstConsumer", value: "WaitForFirstConsumer"},
                    ]
                },
                key: "volumeBindingMode"
            },
            {
                name: "parameters",
                component: ResourceKeyValue,
                option: {label: 'parameters'},
                key: "parameters"
            },
            {
                name: "mountOptions",
                component: StringArray,
                option: {
                    label: "mountOptions",
                },
                key: "mountOptions"
            }
        ];
    }
}