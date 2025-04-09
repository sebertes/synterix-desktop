import {Resource} from "store/resource/Resource.svelte.js";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import Metadata from "components/form/resource/Metadata.svelte";
import ResourceInput from "components/form/resource/ResourceInput.svelte";
import ResourceSelect from "components/form/resource/ResourceSelect.svelte";
import BooleanField from "components/form/resource/BooleanField.svelte";
import ResourceKeyValue from "components/form/resource/ResourceKeyValue.svelte";
import StringArray from "components/form/resource/StringArray.svelte";
import ResourceMultipeSelect from "components/form/resource/ResourceMultipeSelect.svelte";
import StorageClassSelect from "components/form/resource/StorageClassSelect.svelte";

export class PersistentVolume extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.Pod, this.resources.PersistentVolumeClaim];
    }

    getStatus() {
        let pv = this.raw;
        let pvc = this.resources.PersistentVolumeClaim.getAllRawList().filter(a => {
            return a.spec.volumeName === pv.metadata.name;
        })[0];
        let pods = pvc ? this.resources.Pod.getAllRawList().filter(a => {
            return a.spec.volumes.some(v => v.persistentVolumeClaim?.claimName === pvc.metadata.name);
        }) : [];

        const statusChecks = [
            {
                condition: () =>
                    pv.status.phase === 'Released' &&
                    pv.spec.persistentVolumeReclaimPolicy !== 'Delete',
                result: {
                    status: 'Released',
                    className: 'status-released',
                    message: `PV 已从 PVC 释放，但未被删除（回收策略：${pv.spec.persistentVolumeReclaimPolicy}）。需手动清理或重新绑定。`
                }
            },
            {
                condition: () =>
                    pv.status.phase === 'Bound' &&
                    pvc !== null,
                result: {
                    status: 'Bound',
                    className: 'status-bound',
                    message: `PV 已绑定到 PVC ${pvc?.metadata.namespace}/${pvc?.metadata.name}，${
                        pods.length > 0 ? `被 ${pods.length} 个 Pod 使用` : '未被 Pod 使用'
                    }。存储类：${pv.spec.storageClassName || '无'}。`
                }
            },
            {
                condition: () =>
                    pv.status.phase === 'Available',
                result: {
                    status: 'Active',
                    className: 'status-Active',
                    message: `PV 可用但未绑定到任何 PVC。容量：${pv.spec.capacity.storage}，存储类：${pv.spec.storageClassName || '无'}。`
                }
            },
            {
                condition: () =>
                    pv.metadata.deletionTimestamp !== undefined,
                result: {
                    status: 'Terminating',
                    className: 'status-terminating',
                    message: `PV 正在删除中，删除请求时间：${pv.metadata.deletionTimestamp}。回收策略：${pv.spec.persistentVolumeReclaimPolicy}。`
                }
            }
        ];

        return statusChecks.find(check => check.condition()).result;
    }

    getTableRow() {
        let deployment = this.raw;
        const metadata = deployment.metadata || {};

        let item = {
            id: metadata.name,
            name: metadata.name || "",
            status: this.getStatus(deployment),
            reclaim: deployment.spec.persistentVolumeReclaimPolicy || 'Delete',
            pvc: deployment.spec.claimRef ? `${deployment.spec.claimRef.namespace}/${deployment.spec.claimRef.name}` : '-',
            source: deployment.spec.storageClassName || '-',
            reason: deployment.status.reason || '-',
            age: this.age
        };
        item.ready = `${item.availableReplicas}/${item.replicas}`;
        if ((item.status.status !== 'Active' && item.status.status !== 'Bound') && item.status.message) {
            item.rowOption = {className: 'row-desc'};
            item.status.showDescription = true;
        }
        return item;
    }

    getTableHeader() {
        return [
            {name: "State", key: "status", align: "left", width: "100px"},
            {name: "Name", key: "name", align: "left", sortable: true, sorted: "asc"},
            {name: "Reclaim Policy", key: "reclaim", align: "left"},
            {name: "Persistent Volume Claim", key: "pvc", align: "left"},
            {name: "Source", key: "source", align: "left"},
            {name: "Reason ", key: "reason", align: "left"},
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

    isMultiFormDefinition() {
        return true;
    }

    getMultiFormDefinitions() {
        return {
            title: "Select Storage Type",
            types: [
                {name: "HostPath", type: "hostPath", icon: "HP", description: "HostPath"},
                {name: "NFS", type: "nfs", icon: "N", description: "NFS"},
                {name: "AWS EBS", type: "awsElasticBlockStore", icon: "AE", description: "AWS EBS"},
                {
                    name: "GCE Persistent Disk",
                    type: "gcePersistentDisk",
                    icon: "GD",
                    description: "GCE Persistent Disk"
                },
                {name: "CSI", type: "csi", icon: "C", description: "CSI"}
            ]
        };
    }

    getDefinitionType(target) {
        if (target.spec.hostPath) {
            return "hostPath";
        } else if (target.spec.nfs) {
            return "nfs";
        } else if (target.spec.awsElasticBlockStore) {
            return "awsElasticBlockStore";
        } else if (target.spec.gcePersistentDisk) {
            return "gcePersistentDisk";
        } else if (target.spec.csi) {
            return "csi";
        } else {
            return "unknown";
        }
    }

    getFormDefinition(type) {
        let customs = [];
        if (type === 'hostPath') {
            customs = [
                {
                    name: "hostPath", children: [
                        {
                            name: "path",
                            component: ResourceInput,
                            option: {label: "path", type: "text"},
                            key: "spec.hostPath.path"
                        },
                        {
                            name: "type",
                            component: ResourceSelect,
                            option: {
                                label: "type", options: [
                                    {name: "Directory", value: "Directory"},
                                    {name: "DirectoryOrCreate", value: "DirectoryOrCreate"},
                                    {name: "File", value: "File"},
                                ]
                            },
                            key: "spec.hostPath.path"
                        }
                    ]
                }
            ];
        } else if (type === 'nfs') {
            customs = [
                {
                    name: "nfs", children: [
                        {
                            name: "server",
                            component: ResourceInput,
                            option: {label: "server", type: "text"},
                            key: "spec.nfs.server"
                        },
                        {
                            name: "path",
                            component: ResourceInput,
                            option: {label: "path", type: "text"},
                            key: "spec.nfs.path"
                        },
                        {
                            name: "readOnly",
                            component: BooleanField,
                            option: {label: "readOnly"},
                            key: "spec.nfs.readOnly"
                        }
                    ]
                }
            ]
        } else if (type === 'awsElasticBlockStore') {
            customs = [
                {
                    name: "awsElasticBlockStore", children: [
                        {
                            name: "volumeID",
                            component: ResourceInput,
                            option: {label: "volumeID", type: "text"},
                            key: "spec.awsElasticBlockStore.volumeID"
                        },
                        {
                            name: "fsType",
                            component: ResourceInput,
                            option: {label: "fsType", type: "text"},
                            key: "spec.awsElasticBlockStore.fsType"
                        },
                        {
                            name: "partition",
                            component: ResourceInput,
                            option: {label: "partition", type: "number"},
                            key: "spec.awsElasticBlockStore.partition"
                        }
                    ]
                }
            ]
        } else if (type === 'gcePersistentDisk') {
            customs = [
                {
                    name: "gcePersistentDisk", children: [
                        {
                            name: "pdName",
                            component: ResourceInput,
                            option: {label: "pdName", type: "text"},
                            key: "spec.gcePersistentDisk.pdName"
                        },
                        {
                            name: "fsType",
                            component: ResourceInput,
                            option: {label: "fsType", type: "text"},
                            key: "spec.gcePersistentDisk.fsType"
                        },
                        {
                            name: "partition",
                            component: ResourceInput,
                            option: {label: "partition", type: "number"},
                            key: "spec.gcePersistentDisk.partition"
                        }
                    ]
                }
            ]
        } else if (type === 'csi') {
            customs = [
                {
                    name: "csi", children: [
                        {
                            name: "driver",
                            component: ResourceInput,
                            option: {label: "driver", type: "text"},
                            key: "spec.csi.driver"
                        },
                        {
                            name: "volumeHandle",
                            component: ResourceInput,
                            option: {label: "volumeHandle", type: "text"},
                            key: "spec.csi.volumeHandle"
                        },
                        {
                            name: "fsType",
                            component: ResourceInput,
                            option: {label: "fsType", type: "text"},
                            key: "spec.csi.fsType"
                        },
                        {
                            name: "volumeAttributes",
                            component: ResourceKeyValue,
                            key: "spec.csi.volumeAttributes",
                        }
                    ]
                }
            ]
        }
        return [
            {
                name: "metadata",
                component: Metadata,
                key: "metadata",
                option: {label: 'metadata'},
            },
            {
                name: "spec", children: [
                    {
                        name: "capacity", children: [
                            {
                                name: "storage",
                                component: ResourceInput,
                                option: {label: "storage", type: "text"},
                                key: "spec.capacity.storage"
                            }
                        ]
                    },
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
                        name: "persistentVolumeReclaimPolicy",
                        component: ResourceSelect,
                        option: {
                            label: "persistentVolumeReclaimPolicy",
                            options: [
                                {name: "Delete", value: "Delete"},
                                {name: "Retain", value: "Retain"},
                            ]
                        },
                        key: "persistentVolumeReclaimPolicy"
                    },
                    {
                        name: "storageClassName",
                        component: StorageClassSelect,
                        key: "spec.storageClassName"
                    },
                    ...customs,
                    {
                        name: "mountOptions",
                        component: StringArray,
                        option: {
                            label: "mountOptions",
                        },
                        key: "spec.mountOptions"
                    },
                ]
            }
        ];
    }

    async getTemplate(type) {
        return super.getTemplate(this.getDefinitionType(type));
    }
}