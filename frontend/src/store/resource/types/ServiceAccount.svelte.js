import {Resource} from "store/resource/Resource.svelte.js";
import ResourceRefers from "components/resource/ResourceRefers.svelte";

export class ServiceAccount extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.Pod, this.resources.Secret];
    }

    getCreatable(kind) {
        return null;
    }

    getStatus() {
        let serviceAccount = this.raw;
        const pods = this.resources.Pod.getAllRawList().filter(a => {
            return a.spec.serviceAccountName === serviceAccount.metadata.name;
        });
        let secrets = this.resources.Secret.getAllRawList().filter(a => {
            return a.type === 'kubernetes.io/service-account-token' &&
                a.metadata.annotations?.['kubernetes.io/service-account.name'] === serviceAccount.metadata.name;
        });
        const statusChecks = [
            {
                condition: () => {
                    if (pods.length === 0) return false;
                    return secrets.some(secret => !secret.data || secret.metadata.annotations?.['kubernetes.io/service-account.uid'] !== serviceAccount.metadata.uid);
                },
                result: {
                    status: 'InUseWithError',
                    className: 'status-in-use-with-error',
                    message: `ServiceAccount 被 ${pods.length} 个 Pod 使用，但关联的 Secret 可能无效（如 Token 过期或 UID 不匹配）。请检查 Secrets：${secrets.map(s => s.metadata.name).join(', ')}`
                }
            },
            {
                condition: () => pods.length > 0,
                result: {
                    status: 'Active',
                    className: 'status-active',
                    message: `ServiceAccount 正在被 ${pods.length} 个 Pod 使用。关联 Secrets：${secrets.map(s => s.metadata.name).join(', ') || '无'}`
                }
            },
            {
                condition: () => secrets.length > 0,
                result: {
                    status: 'Active',
                    className: 'status-active',
                    message: `ServiceAccount 有效但未被任何 Pod 使用。已生成 Secrets：${secrets.map(s => s.metadata.name).join(', ')}`
                }
            },
            {
                condition: () => true,
                result: {
                    status: 'Orphaned',
                    className: 'status-orphaned',
                    message: `ServiceAccount 未被使用且无关联的 Secrets。${serviceAccount.automountServiceAccountToken === false ? '（automountServiceAccountToken 已显式关闭）' : '可能未生成 Token。'}`
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
            secrets: spec.secrets?.length || 0,
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
            {name: "Secrets", key: "secrets", align: "left"},
            {name: "Age", key: "age", align: "center", width: "80px", sortable: true},
        ];
    }

    getActions() {
        return [
            'EditYaml',
            'CloneYaml',
            'line',
            'Download',
            'Delete'
        ]
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
}