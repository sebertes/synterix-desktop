import {Resource} from "store/resource/Resource.svelte.js";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import RoleRules from "components/form/resource/RoleRules.svelte";
import Metadata from "components/form/resource/Metadata.svelte";

export class Role extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.RoleBinding];
    }

    getStatus() {
        let role = this.raw;
        let bindings = this.resources.RoleBinding.getAllRawList().filter(a => {
            return a.roleRef.name === role.metadata.name;
        });
        const statusChecks = [
            {
                condition: () => bindings.length === 0,
                result: {
                    status: 'Unused',
                    className: 'status-unused',
                    message: `Role 未被任何 RoleBinding/ClusterRoleBinding 引用。命名空间：${role.metadata.namespace || '集群'}`
                }
            },
            {
                condition: () => true, // 默认状态
                result: {
                    status: 'Active',
                    className: 'status-active',
                    message: `Role 正常使用中。关联的 Binding 数量：${bindings.length}，规则数量：${role.rules?.length || 0}`
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
                name: "rules",
                component: RoleRules,
                key: "rules",
            }
        ];
    }
}