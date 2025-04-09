import {Resource} from "store/resource/Resource.svelte.js";
import Table from "components/Table.svelte";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import Metadata from "components/form/resource/Metadata.svelte";
import ResourceInput from "components/form/resource/ResourceInput.svelte";
import IngressServiceSelect from "components/form/resource/IngressServiceSelect.svelte";
import IngressRules from "components/form/resource/IngressRules.svelte";
import IngressCertificates from "components/form/resource/IngressCertificates.svelte";

export class Ingress extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.Service, this.resources.Endpoints];
    }

    getStatus() {
        let ingress = this.raw;
        const {metadata, status, spec} = this.raw;
        let serviceNames = this.getBackendServiceNames(ingress);
        let services = this.resources.Service.getAllRawList().filter(a => serviceNames.includes(a.metadata.name));
        let endpoints = this.resources.Endpoints.getAllRawList().filter(a => serviceNames.includes(a.metadata.name));
        let events = [];

        if (metadata.deletionTimestamp) {
            return {
                status: 'Terminating',
                className: 'status-terminating',
                description: `Ingress 正在删除 (删除时间: ${metadata.deletionTimestamp})，等待关联资源清理完成`
            };
        }
        const failedCondition = status?.conditions?.find(c => c.type === 'Failed' && c.status === 'True');
        if (failedCondition) {
            return {
                status: 'Failed',
                className: 'status-failed',
                description: `配置失败: ${failedCondition.message} (错误代码: ${failedCondition.reason})`
            };
        }
        if (!status?.loadBalancer?.ingress?.length) {
            const pendingEvents = events.filter(e => e.type === 'Warning' && e.reason === 'Pending');
            return {
                status: 'Pending',
                className: 'status-pending',
                description: pendingEvents.length
                    ? `等待负载均衡器配置: ${pendingEvents[0].message}`
                    : '等待负载均衡器分配IP/端口'
            };
        }
        const unhealthyServices = services.filter(service => {
            const endpoint = endpoints.find(ep => ep.metadata.name === service.metadata.name);
            return !endpoint || endpoint.subsets?.some(subset =>
                subset.addresses?.length === 0
            );
        });

        if (unhealthyServices.length > 0) {
            return {
                status: 'Unhealthy',
                className: 'status-unhealthy',
                description: `${unhealthyServices.length} 个后端服务不可用 (例如: ${unhealthyServices[0].metadata.name})`
            };
        }
        const expiredCerts = spec.tls?.filter(tls => {
            const certSecret = relatedData.secrets?.find(s => s.metadata.name === tls.secretName);
            if (!certSecret) return false;
            const certExpiry = new Date(certSecret.data['tls.crt']); // 实际需要解析证书
            return certExpiry < new Date();
        }) || [];
        if (expiredCerts.length > 0) {
            return {
                status: 'Expired',
                className: 'status-expired',
                description: `${expiredCerts.length} 个证书已过期 (例如: ${expiredCerts[0].secretName})`
            };
        }
        const generationDiff = status.observedGeneration && (metadata.generation !== status.observedGeneration);
        const outOfSyncEvents = events.filter(e =>
            e.reason === 'ResourceUpdate' && e.type === 'Warning'
        );
        if (generationDiff || outOfSyncEvents.length > 0) {
            return {
                status: 'OutOfSync',
                className: 'status-out-of-sync',
                description: `配置未同步 (当前版本: ${status.observedGeneration}, 期望版本: ${metadata.generation})`
            };
        }
        return {
            status: 'Active',
            className: 'status-active',
            description: `Ingress 运行正常，已关联 ${services.length} 个后端服务，LB地址: ${status.loadBalancer.ingress[0].ip}`
        };
    }

    getTableRow() {
        let ingress = this.raw;
        const metadata = ingress.metadata;
        const spec = ingress.spec;
        const targets = [];
        const status = this.getStatus();
        if (spec.rules) {
            spec.rules.forEach(rule => {
                if (rule.http && rule.http.paths) {
                    rule.http.paths.forEach(path => {
                        targets.push({
                            url: `http://${rule.host}${path.path}`,
                            service: path.backend.serviceName,
                            serviceTarget: `${path.backend.serviceName}:${path.backend.servicePort}`
                        });
                    });
                }
            });
        }
        let item = {
            id: metadata.name,
            status,
            name: metadata.name,
            namespace: metadata.namespace,
            target: targets,
            default: !!spec.backend,
            defaultService: spec.backend?.serviceName,
            defaultServicePort: spec.backend?.servicePort,
            age: this.age
        };
        if (item.status.status !== 'Active' && item.status.description) {
            item.rowOption = {className: 'row-desc'};
            item.status.showDescription = true;
        }
        return item;
    }

    getBackendServiceNames() {
        let ingress = this.raw;
        const serviceNames = new Set();
        for (const rule of ingress.spec?.rules || []) {
            for (const path of rule.http?.paths || []) {
                if (path.backend?.serviceName) {
                    serviceNames.add(path.backend.serviceName);
                }
            }
        }
        return Array.from(serviceNames);
    }

    getTableHeader() {
        return [
            {name: "State", key: "status", align: "left", width: "100px"},
            {name: "Name", key: "name", align: "left", width: "100px", sortable: true, sorted: "asc"},
            {name: "Namespace", key: "namespace", align: "left", width: "150px"},
            {name: "Target", key: "target", align: "left"},
            {name: "Default", key: "default", align: "center", width: "100px"},
            {name: "Age", key: "age", align: 'right', width: "100px", sortable: true}
        ];
    }

    getIntro(resource) {
        return [];
    }

    getDetailTabs(ingress) {
        let rows = [];
        if (ingress) {
            ingress.spec?.rules.forEach(rule => {
                rule?.http.paths.forEach(path => {
                    rows.push({
                        path: `http://${rule.host}${path.path}`,
                        pathType: path.pathType,
                        serviceName: path.backend.serviceName,
                        servicePort: path.backend.servicePort
                    });
                });
            });
            return [
                {
                    id: "rules",
                    title: "Rules",
                    component: Table,
                    params: {
                        header: [
                            {name: "Path Type", key: "pathType", align: "left"},
                            {name: "Path", key: "path", align: "left", linkable: true, link: row => row.path},
                            {
                                name: "Target Service",
                                key: "serviceName",
                                align: "left",
                                linkable: true,
                                link: row => `/services/${row.serviceName}`
                            },
                            {name: "Port", key: "servicePort", align: "left"}
                        ],
                        buttons: [],
                        menus: [],
                        checkbox: false,
                        data: rows
                    }
                },
                {
                    id: "refers",
                    title: "Related Resources",
                    component: ResourceRefers,
                    params: {
                        name: ingress.metadata.name,
                        namespace: ingress.metadata.namespace,
                        kind: ingress.kind,
                    }
                }
            ];
        }
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
                name: "spec", component: null, key: "spec", children: [
                    {
                        name: "ingressClassName",
                        component: ResourceInput,
                        option: {label: 'ingressClassName', type: "text"},
                        key: "spec.ingressClassName",
                    },
                    {name: "defaultBackend", component: IngressServiceSelect, key: "spec.defaultBackend.service"},
                    {name: "rules", component: IngressRules, key: "spec.rules"},
                    {name: "tls", component: IngressCertificates, key: "spec.tls"},
                ]
            },
        ];
    }
}