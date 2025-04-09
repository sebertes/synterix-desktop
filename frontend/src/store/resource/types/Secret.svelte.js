import {Resource} from "store/resource/Resource.svelte.js";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import ConfigmapDetail from "components/ConfigmapDetail.svelte";
import Metadata from "components/form/resource/Metadata.svelte";
import ConfigmapData from "components/form/resource/ConfigmapData.svelte";
import ResourceInput from "components/form/resource/ResourceInput.svelte";
import ResourceLabel from "components/form/resource/ResourceLabel.svelte";
import ConfigmapStringData from "components/form/resource/ConfigmapStringData.svelte";

export class Secret extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.Pod, this.resources.ServiceAccount];
    }

    getStatus() {
        let secret = this.raw;
        let serviceAccount = this.resources.ServiceAccount.getAllRawList().find(a => {
            return secret.metadata.annotations?.['kubernetes.io/service-account.name'] === a.metadata.name;
        });
        let secretName = secret.metadata.name;
        let pods = this.resources.Pod.getAllRawList().filter(pod => {
            const volumeRefs = pod.spec.volumes?.filter(v => v.secret?.secretName === secretName).length || 0;
            const envRefs = pod.spec.containers?.flatMap(c => c.env?.filter(e => e.valueFrom?.secretKeyRef?.name === secretName)).length || 0;
            return volumeRefs > 0 || envRefs > 0;
        });
        const statusChecks = [
            {
                condition: () =>
                    pods.length === 0 &&
                    !serviceAccount &&
                    !this.isSystemSecret(secret),
                result: {
                    status: 'Orphaned',
                    className: 'status-orphaned',
                    message: 'Secret 未被任何 Pod 或 ServiceAccount 使用，可能是残留资源。'
                }
            },
            {
                condition: () =>
                    secret.type === 'kubernetes.io/token' &&
                    this.isSecretExpired(secret),
                result: {
                    status: 'Expired',
                    className: 'status-expired',
                    message: 'Secret 中的 Token 已过期，需重新生成。'
                }
            },
            {
                condition: () => true,
                result: {
                    status: 'Active',
                    className: 'status-active',
                    message: `Secret 状态正常。${pods.length > 0 ? `被 ${pods.length} 个 Pod 使用` : '未被 Pod 使用'}${serviceAccount ? `，关联 ServiceAccount：${serviceAccount.metadata.name}` : ''}`
                }
            }
        ];
        return statusChecks.find(check => check.condition()).result;
    }

    isSecretExpired(secret) {
        if (secret.type !== 'kubernetes.io/token') return false;
        const expiration = secret.metadata.annotations?.['kubernetes.io/service-account.expiration'];
        return expiration && new Date(expiration) < new Date();
    }

    isSystemSecret(secret) {
        return secret.metadata.name.startsWith('default-token-');
    }

    getTableRow() {
        let deployment = this.raw;
        const metadata = deployment.metadata || {};
        const spec = deployment.spec || {};

        const kindMap = {
            "Opaque": 'Opaque',
            "kubernetes.io/service-account-token": 'Service Account Token',
            "bootstrap.kubernetes.io/token": 'Bootstrap Token',
            "kubernetes.io/dockerconfigjson": 'Docker Config',
            "kubernetes.io/basic-auth": 'Basic Auth',
            "kubernetes.io/ssh-auth": 'SSH Auth',
            "kubernetes.io/tls": 'TLS',
        }

        console.log(deployment.type, kindMap[deployment.type.trim()]);
        let item = {
            id: metadata.name,
            name: metadata.name || "",
            namespace: metadata.namespace || "",
            status: this.getStatus(deployment),
            kind: kindMap[deployment.type] || deployment.type,
            data: Reflect.ownKeys(deployment.data || {}),
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
            {name: "Kind", key: "kind", align: "left"},
            {name: "Data", key: "data", align: "left", sortable: true},
            {name: "Age", key: "age", align: "center", width: "80px", sortable: true},
        ];
    }

    getIntro(deployment) {
        return [];
    }

    getDetailTabs(configmap) {
        return [
            {
                id: "data",
                title: "Data",
                component: ConfigmapDetail,
                params: {
                    configmap
                }
            },
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
            title: "Select Secret Type",
            types: [
                {name: "Opaque", type: "Opaque", icon: "O", description: "Opaque"},
                {
                    name: "Docker Registry",
                    type: "kubernetes.io/dockerconfigjson",
                    icon: "DR",
                    description: "Docker Registry"
                },
                {name: "TLS", type: "kubernetes.io/tls", icon: "T", description: "TLS"},
                {name: "Http Basic Auth", type: "kubernetes.io/basic-auth", icon: "HA", description: "Http Basic Auth"},
                {name: "SSH", type: "kubernetes.io/ssh-auth", icon: "S", description: "SSH"},
                {
                    name: "Bootstrap Token",
                    type: "bootstrap.kubernetes.io/token",
                    icon: "BT",
                    description: "Bootstrap Token"
                },
            ]
        };
    }

    getDefinitionType(target) {
        return target.type;
    }

    getFormDefinition(type) {
        if (type === "Opaque") {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "type", component: ResourceLabel, option: {
                        value: "Opaque",
                    }, key: "type",
                },
                {
                    name: "data", component: ConfigmapData, key: "data", defaultValue() {
                        return []
                    }
                },
                {
                    name: "stringData", component: ConfigmapStringData, key: "stringData", defaultValue() {
                        return []
                    }
                },
            ];
        } else if (type === "kubernetes.io/dockerconfigjson") {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "type", component: ResourceLabel, option: {
                        value: "kubernetes.io/dockerconfigjson",
                    }, key: "type",
                },
                {
                    name: 'data', children: [
                        {name: '.dockerconfigjson', component: ResourceInput, key: "data.'.dockerconfigjson'"}
                    ]
                }
            ];
        } else if (type === "kubernetes.io/tls") {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "type", component: ResourceLabel, option: {
                        value: "kubernetes.io/tls",
                    }, key: "type",
                },
                {
                    name: 'data', children: [
                        {name: 'tls.crt', component: ResourceInput, key: "data.'tls.crt'"},
                        {name: 'tls.key', component: ResourceInput, key: "data.'tls.key'"}
                    ]
                }
            ];
        } else if (type === "kubernetes.io/basic-auth") {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "type", component: ResourceLabel, option: {
                        value: "kubernetes.io/tls",
                    }, key: "type",
                },
                {
                    name: 'data', children: [
                        {name: 'username', component: ResourceInput, key: "data.username"},
                        {name: 'password', component: ResourceInput, key: "data.password"}
                    ]
                }
            ];
        } else if (type === "kubernetes.io/ssh-auth") {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "type", component: ResourceLabel, option: {
                        value: "kubernetes.io/tls",
                    }, key: "type",
                },
                {
                    name: 'data', children: [
                        {name: 'ssh-privatekey', component: ResourceInput, key: "data.ssh-privatekey"},
                        {name: 'ssh-ppublickey', component: ResourceInput, key: "data.ssh-ppublickey"}
                    ]
                }
            ];
        } else if (type === "bootstrap.kubernetes.io/token") {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "type", component: ResourceLabel, option: {
                        value: "kubernetes.io/tls",
                    }, key: "type",
                },
                {
                    name: 'data', children: [
                        {name: 'token-id', component: ResourceInput, key: "data.token-id"},
                        {name: 'token-secret', component: ResourceInput, key: "data.token-secret"}
                    ]
                }
            ];
        } else if (type === "kubernetes.io/service-account-token") {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "type", component: ResourceLabel, option: {
                        value: "kubernetes.io/tls",
                    }, key: "type",
                },
                {
                    name: 'data', children: [
                        {name: 'ca.crt', component: ResourceInput, key: "data.ca.crt"},
                        {name: 'namespace', component: ResourceInput, key: "data.namespace"},
                        {name: 'token', component: ResourceInput, key: "data.token"}
                    ]
                }
            ];
        } else {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                }
            ]
        }
    }

    async getTemplate(type) {
        const kindMap = {
            "Opaque": 'Opaque',
            "kubernetes.io/service-account-token": 'ServiceAccountToken',
            "bootstrap.kubernetes.io/token": 'BootstrapToken',
            "kubernetes.io/dockerconfigjson": 'DockerConfig',
            "kubernetes.io/basic-auth": 'BasicAuth',
            "kubernetes.io/ssh-auth": 'SSHAuth',
            "kubernetes.io/tls": 'TLS',
        }
        let t = kindMap[type];
        if (!t) {
            t = 'Unknow';
        }
        return super.getTemplate(t);
    }
}