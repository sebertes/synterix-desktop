import {Resource} from "store/resource/Resource.svelte.js";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import Metadata from "components/form/resource/Metadata.svelte";
import ResourceMultipeSelect from "components/form/resource/ResourceMultipeSelect.svelte";
import Selector from "components/form/resource/Selector.svelte";
import ResourceInput from "components/form/resource/ResourceInput.svelte";
import ResourceSelect from "components/form/resource/ResourceSelect.svelte";
import StorageClassSelect from "components/form/resource/StorageClassSelect.svelte";

export class PersistentVolumeClaim extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.Pod];
    }

    getStatus() {
        let pvc = this.raw, pv = null;
        let pods = this.resources.Pod.getAllRawList().filter(a => {
            return a.spec.volumes?.some(b => {
                return b.persistentVolumeClaim?.claimName === pvc.metadata.name;
            });
        });
        const statusChecks = [
            // {
            //     condition: () =>
            //         pvc.status.phase === 'Bound' &&
            //         (!pv || (pv.status.phase !== 'Bound' && pv.status.phase !== 'Available')),
            //     result: {
            //         status: 'Lost',
            //         className: 'status-lost',
            //         message: `PVC 绑定的 PersistentVolume ${pvc.spec.volumeName || ''} 已丢失或不可用。PV 状态：${pv?.status.phase || '不存在'}。`
            //     }
            // },
            {
                condition: () =>
                    pvc.status.phase === 'Bound' &&
                    pods.length === 0,
                result: {
                    status: 'Bound',
                    className: 'status-bound',
                    message: `PVC 已绑定到 PV ${pvc.spec.volumeName}，但未被任何 Pod 使用。PV 状态：${pv?.status.phase || '未知'}。`
                }
            },
            {
                condition: () =>
                    pvc.status.phase === 'Bound' &&
                    pods.length > 0,
                result: {
                    status: 'Active',
                    className: 'status-active',
                    message: `PVC 已绑定到 PV ${pvc.spec.volumeName}，并被 ${pods.length} 个 Pod 使用。PV 状态：${pv?.status.phase || '未知'}。`
                }
            },
            {
                condition: () =>
                    pvc.status.phase === 'Released',
                result: {
                    status: 'Released',
                    className: 'status-released',
                    message: `PVC 已释放，但关联的 PV ${pvc.spec.volumeName} 未被回收。PV 状态：${pv?.status.phase || '未知'}。`
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
            namespace: metadata.namespace || "",
            status: this.getStatus(deployment),
            statusStr: deployment.status.phase,
            volume: deployment.spec.volumeName || "",
            capacity: deployment.status.capacity?.storage || "",
            accessModes: deployment.spec.accessModes?.join(",") || "",
            storageClassName: deployment.spec.storageClassName || "",
            volumeMode: deployment.spec.volumeMode || "",
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
            {name: "Namespace", key: "namespace", align: "left"},
            {name: "Status", key: "statusStr", align: "left"},
            {name: "Volume", key: "volume", align: "left"},
            {name: "Capacity", key: "capacity", align: "left"},
            {name: "Access Modes", key: "accessModes", align: "left"},
            {name: "StorageClass", key: "storageClassName", align: "left"},
            {name: "VolumeMode ", key: "volumeMode", align: "left"},
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
            {
                name: "spec", children: [
                    {name: "storageClassName", component: StorageClassSelect, key: "spec.storageClassName"},
                    {
                        name: "accessModes",
                        key: "spec.accessModes",
                        component: ResourceMultipeSelect,
                        option: {
                            label: "Access Modes",
                            options: [
                                {name: "ReadWriteOnce", value: "ReadWriteOnce"},
                                {name: "ReadOnlyMany", value: "ReadOnlyMany"},
                                {name: "ReadWriteMany", value: "ReadWriteMany"}
                            ]
                        },
                    },
                    {
                        name: "volumeMode",
                        key: "spec.volumeMode",
                        component: ResourceSelect,
                        option: {
                            label: "Volume Mode",
                            options: [
                                {name: "Filesystem", value: "Filesystem"},
                                {name: "Block", value: "Block"}
                            ]
                        },
                    },
                    {
                        name: "resources", children: [
                            {
                                name: "requests", children: [
                                    {
                                        name: "storage",
                                        key: "spec.resources.requests.storage",
                                        component: ResourceInput,
                                        option: {label: "Storage"}
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "selector", component: Selector, key: "spec.selector", defaultValue() {
                            return {};
                        }
                    }
                ]
            }
        ];
    }
}