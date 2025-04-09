import {Resource} from "store/resource/Resource.svelte.js";
import ResourceRefers from "components/resource/ResourceRefers.svelte";

export class ClusterRoleBinding extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.ClusterRole, this.resources.ServiceAccountAll];
    }

    getCreatable(kind) {
        return null;
    }

    getStatus() {
        let clusterRoleBinding = this.raw;
        let clusterRole = this.resources.ClusterRole.getAllRawList().find(a => {
            return a.metadata.name === clusterRoleBinding.roleRef.name;
        });
        let subjectsStatus = clusterRoleBinding.subjects.map(subject => {
            let valid = false;
            if (subject.kind === 'ServiceAccount') {
                let list = this.resources.ServiceAccountAll.getAllRawList().filter(a => {
                    return a.metadata.name === subject.name;
                });
                valid = list.length > 0;
            } else if (subject.kind === 'User' || subject.kind === 'Group') {
                valid = true;
            }
            return {name: subject.name, kind: subject.kind, valid};
        });
        const statusChecks = [
            {
                condition: () => {
                    // 检查 ClusterRole 是否存在
                    const isClusterRoleMissing = !clusterRole;
                    // 检查是否有 Subject 无效（如 ServiceAccount 不存在）
                    const hasInvalidSubject = subjectsStatus.some(subject => !subject.valid);
                    return isClusterRoleMissing || hasInvalidSubject;
                },
                result: {
                    status: 'Invalid',
                    className: 'status-invalid',
                    message: `ClusterRoleBinding 配置无效。${
                        !clusterRole ? `关联的 ClusterRole "${clusterRoleBinding.roleRef.name}" 不存在。` : ''
                    }${
                        subjectsStatus.filter(s => !s.valid).map(s => `Subject "${s.name}" (${s.kind}) 无效。`).join(' ')
                    }`
                }
            },
            {
                condition: () => true,
                result: {
                    status: 'Active',
                    className: 'status-active',
                    message: `ClusterRoleBinding 正在生效。绑定的 ClusterRole：${clusterRoleBinding.roleRef.name}，Subjects：${
                        subjectsStatus.map(s => `${s.kind}/${s.name}`).join(', ')
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
            status: this.getStatus(deployment),
            role: deployment.roleRef.kind + "/" + deployment.roleRef.name,
            users: deployment.subjects.filter(a => a.kind === 'User').map(a => a.name).join(","),
            groups: deployment.subjects.filter(a => a.kind === 'Group').map(a => a.name).join(","),
            serviceAccounts: deployment.subjects.filter(a => a.kind === 'ServiceAccount').map(a => `${a.namespace}/${a.name}`).join(","),
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
            {name: "Role", key: "role", align: "left"},
            {name: "Users", key: "users", align: "left"},
            {name: "Groups", key: "groups", align: "left"},
            {name: "ServiceAccounts", key: "serviceAccounts", align: "left"},
            {name: "Age", key: "age", align: "center", width: "80px", sortable: true},
        ];
    }

    getIntro(deployment) {
        return [];
    }

    getActionPages(deployment) {
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
}