import {Resource} from "store/resource/Resource.svelte.js";
import ResourceRefers from "components/resource/ResourceRefers.svelte";

export class NetworkPolicy extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.Pod];
    }

    getStatus() {
        let networkPolicy = this.raw;
        let pods = this.resources.Pod.getAllRawList().filter(a => {
            return a.spec.volumes?.some(v => {
                return v.persistentVolumeClaim?.claimName === networkPolicy.metadata.name;
            });
        });
        let isNetworkPluginSupported = true;
        const statusChecks = [
            {
                condition: () => !isNetworkPluginSupported,
                result: {
                    status: 'Unsupported',
                    className: 'status-unsupported',
                    description: '当前集群网络插件不支持 NetworkPolicy 功能。需使用 Calico、Cilium 等支持 CNI。'
                }
            },
            {
                condition: () => pods.length === 0,
                result: {
                    status: 'Inactive',
                    className: 'status-inactive',
                    description: `NetworkPolicy 未应用到任何 Pod。当前 podSelector 规则：${
                        JSON.stringify(networkPolicy.spec.podSelector)
                    }`
                }
            },
            {
                condition: () => true, // 默认状态
                result: {
                    status: 'Active',
                    className: 'status-active',
                    description: `NetworkPolicy 正在生效。影响 ${
                        pods.length
                    } 个 Pod，规则类型：${
                        networkPolicy.spec.ingress ? 'Ingress' : ''
                    }${
                        networkPolicy.spec.egress ? (networkPolicy.spec.ingress ? '+' : '') + 'Egress' : ''
                    }`
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
            podSelector: Reflect.ownKeys(spec.podSelector?.matchLabels || {}).map(a => {
                return `${a}=${spec.podSelector.matchLabels[a]}`;
            }).join(';'),
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
            {name: "Namespace", key: "namespace", align: "left", width: "130px"},
            {name: "Pod-Selector", key: "podSelector", align: "left"},
            {name: "Age", key: "age", align: "center", width: "80px", sortable: true},
        ];
    }

    getIntro(deployment) {
        return [];
    }

    getCreatable() {
        return null;
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
}