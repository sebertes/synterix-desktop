import {Resource} from "store/resource/Resource.svelte.js";
import DownloadIcon from "components/icons/DownloadIcon.svelte";
import DeleteIcon from "components/icons/DeleteIcon.svelte";
import PodsLite from "components/PodsLite.svelte";
import Table from "components/Table.svelte";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import Metadata from "components/form/resource/Metadata.svelte";
import Selector from "components/form/resource/Selector.svelte";
import ClusterIpPorts from "components/form/resource/service/ClusterIpPorts.svelte";
import ResourceInput from "components/form/resource/ResourceInput.svelte";
import NodePortPorts from "components/form/resource/service/NodePortPorts.svelte";
import LoadBalancerPorts from "components/form/resource/service/LoadBalancerPorts.svelte";
import HeadlessPorts from "components/form/resource/service/HeadlessPorts.svelte";
import ResourceKeyValue from "components/form/resource/ResourceKeyValue.svelte";
import ResourceLabel from "components/form/resource/ResourceLabel.svelte";

const SERVICE_STATUS = {
    Active: {
        status: "Active",
        className: "status-active",
        description: (svc, endpoints) => {
            const readyEndpoints = endpoints?.subsets?.[0]?.addresses?.length || 0;
            return `Service is active (${readyEndpoints} endpoints available)`;
        }
    },
    Degraded: {
        status: "Degraded",
        className: "status-degraded",
        description: (svc, endpoints) => {
            const totalEndpoints = endpoints?.subsets?.[0]?.addresses?.length || 0;
            const notReady = endpoints?.subsets?.[0]?.notReadyAddresses?.length || 0;
            return `${notReady}/${totalEndpoints + notReady} endpoints not ready`;
        }
    },
    Error: {
        status: "Error",
        className: "status-error",
        description: (svc) => {
            if (!svc.spec.selector) return "Service has no selector (cannot route traffic)";
            if (svc.spec.type === "LoadBalancer" && !svc.status?.loadBalancer?.ingress)
                return "LoadBalancer IP is pending";
            return "Service configuration is invalid (check ports or selectors)";
        }
    },
    Pending: {
        status: "Pending",
        className: "status-pending",
        description: (svc) => {
            if (svc.spec.type === "LoadBalancer")
                return "Waiting for LoadBalancer IP assignment";
            return "Service is initializing";
        }
    },
    Unknown: {
        status: "Unknown",
        className: "status-unknown",
        description: () => "Service state cannot be determined"
    }
};

export class Service extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.Endpoints];
    }

    getStatus() {
        let endpoints = this.resources.Endpoints.getRawList().find(b => this.name === b.metadata.name);
        let svc = this.raw;
        const {spec = {}, status = {}} = svc;
        if (!spec.selector || Object.keys(spec.selector).length === 0) {
            return {
                ...SERVICE_STATUS.Error,
                message: SERVICE_STATUS.Error.description(svc)
            };
        }
        if (spec.type === "LoadBalancer" && !status.loadBalancer?.ingress) {
            return {
                ...SERVICE_STATUS.Pending,
                message: SERVICE_STATUS.Pending.description(svc)
            };
        }
        const hasEndpoints = endpoints?.subsets?.length > 0;
        const readyEndpoints = endpoints?.subsets?.[0]?.addresses?.length || 0;
        const notReadyEndpoints = endpoints?.subsets?.[0]?.notReadyAddresses?.length || 0;
        if (!hasEndpoints || readyEndpoints === 0) {
            return {
                ...SERVICE_STATUS.Error,
                message: "No endpoints available"
            };
        }
        if (notReadyEndpoints > 0) {
            return {
                ...SERVICE_STATUS.Degraded,
                message: SERVICE_STATUS.Degraded.description(svc, endpoints)
            };
        }
        return {
            ...SERVICE_STATUS.Active,
            message: SERVICE_STATUS.Active.description(svc, endpoints)
        };
    }

    getTableRow() {
        let service = this.raw;
        let a = {
            id: service.metadata.name,
            status: this.getStatus(),
            name: service.metadata.name,
            namespace: service.metadata.namespace,
            svcTarget: service.spec.ports.map(port => `${port.targetPort}/${port.protocol}`).join(', '),
            selector: Object.entries(service.spec.selector || {}).map(([key, value]) => `${key}=${value}`).join(', '),
            type: service.spec.clusterIP && service.spec.clusterIP === 'None' ? 'Headless' : service.spec.type,
            age: this.age
        };
        if (a.status.message && a.status.status !== 'Active') {
            a.rowOption = {className: 'row-desc'};
            a.showDescription = true;
        }
        return a;
    }

    getTableHeader() {
        return [
            {name: "State", key: "status", align: "left", width: "100px"},
            {name: "Name", key: "name", align: "left", width: "200px", sortable: true, sorted: "asc"},
            {name: "Namespace", key: "namespace", align: "left", width: "100px"},
            {name: "Target", key: "svcTarget", align: "left", width: "100px"},
            {name: "Selector", key: "selector", align: "left"},
            {name: "Type", key: "type", align: "center", width: "100px"},
            {name: "Age", key: "age", align: 'center', width: "100px", sortable: true}
        ];
    }

    getTableButtons() {
        return [
            {
                label: 'Download YAML',
                icon: DownloadIcon,
                action: (ids) => {
                    // data = data.filter(a => !ids.includes(a.id));
                }
            },
            {
                label: 'Delete',
                icon: DeleteIcon,
                action: (ids) => {
                    console.log(ids);
                }
            }
        ];
    }

    getActions() {
        return [
            'Detail',
            'Yaml',
            'Config',
            'EditConfig',
            'EditYaml',
            'Clone',
            'line',
            'Download',
            'Delete',
            'Proxy'
        ]
    }

    getIntro(resource) {
        return [
            {key: "Type", value: resource.spec.type},
            {key: "Cluster IP:", value: resource.spec.clusterIP},
            {key: "Session Affinity", value: resource.spec.sessionAffinity},
        ];
    }

    getDetailTabs(service) {
        return [
            {
                id: "pods",
                title: "Pods",
                component: PodsLite,
                params: {
                    params: {
                        matchLabels: service.spec.selector
                    }
                }
            },
            {
                id: "ports",
                title: "Ports",
                component: Table,
                params: {
                    header: [
                        {name: "Name", key: "name", align: "left"},
                        {name: "Port", key: "port", align: "left"},
                        {name: "Protocol", key: "protocol", align: "left"},
                        {name: "Target", key: "targetPort", align: "left"}
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: service.spec.ports || []
                }
            },
            {
                id: "selector",
                title: "Selectors",
                component: Table,
                params: {
                    header: [
                        {name: "Key", key: "key", align: "left"},
                        {name: "Value", key: "value", align: "left"}
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: Reflect.ownKeys(service.spec.selector || {}).map(a => {
                        return {
                            key: a,
                            value: service.spec.selector[a]
                        }
                    })
                }
            },
            {
                id: "conditions",
                title: "Conditions",
                component: Table,
                params: {
                    header: [
                        {name: "Condition", key: "type", align: "left"},
                        {name: "Status", key: "status", align: "left"},
                        {name: "Updated", key: "lastTransitionTime", align: "left"},
                        {name: "Message", key: "message", align: "left"}
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: service.status.conditions || []
                }
            },
            {
                id: "refers",
                title: "Related Resources",
                component: ResourceRefers,
                params: {
                    name: service.metadata.name,
                    namespace: service.metadata.namespace,
                    kind: service.kind,
                }
            }
        ];
    }

    getDetailComponents(resourceKind) {
        return [];
    }

    isMultiFormDefinition() {
        return true;
    }

    getMultiFormDefinitions() {
        return {
            title: "Select Service Type",
            types: [
                {name: "ClusterIP", type: "ClusterIP", icon: "CI", description: "ClusterIP"},
                {name: "Headless", type: "Headless", icon: "H", description: "ClusterIP"},
                {name: "NodePort", type: "NodePort", icon: "NP", description: "NodePort"},
                {name: "LoadBalancer", type: "LoadBalancer", icon: "LB", description: "LoadBalancer"},
                {name: "ExternalName", type: "ExternalName", icon: "EN", description: "ExternalName"},
            ]
        };
    }

    getDefinitionType(target) {
        if (target?.spec?.clusterIP && target?.spec?.clusterIP === 'None') {
            return "Headless";
        } else {
            return target?.spec?.type || 'ClusterIP';
        }
    }

    getFormDefinition(type) {
        if (type === 'ClusterIP') {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "spec", component: null, key: "spec", children: [
                        {name: "type", component: ResourceLabel, key: "spec.type"},
                        {name: "selector", component: ResourceKeyValue, key: "spec.selector"},
                        {name: "ports", component: ClusterIpPorts, key: "spec.ports"},
                    ]
                },
            ]
        } else if (type === 'Headless') {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "spec", component: null, key: "spec", children: [
                        {name: "clusterIP", component: ResourceLabel, key: "spec.clusterIP"},
                        {name: "selector", component: Selector, key: "spec.selector"},
                        {name: "ports", component: HeadlessPorts, key: "spec.ports"},
                    ]
                },
            ]
        } else if (type === 'NodePort') {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "spec", component: null, key: "spec", children: [
                        {name: "type", component: ResourceLabel, key: "spec.type"},
                        {name: "selector", component: Selector, key: "spec.selector"},
                        {name: "ports", component: NodePortPorts, key: "spec.ports"},
                    ]
                },
            ]
        } else if (type === 'LoadBalancer') {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "spec", component: null, key: "spec", children: [
                        {name: "type", component: ResourceLabel, key: "spec.type"},
                        {
                            name: "loadBalancerIP", component: ResourceInput, option: {
                                label: "loadBalancerIP",
                                type: "text",
                            }, key: "spec.loadBalancerIP"
                        },
                        {name: "ports", component: LoadBalancerPorts, key: "spec.ports"},
                    ]
                },
            ]
        } else if (type === 'ExternalName') {
            return [
                {
                    name: "metadata",
                    component: Metadata,
                    key: "metadata",
                    option: {label: 'metadata'},
                },
                {
                    name: "spec", component: null, key: "spec", children: [
                        {name: "type", component: ResourceLabel, key: "spec.type"},
                        {
                            name: "externalName", component: ResourceInput, option: {
                                label: "ExternalName",
                                type: "text",
                            }, key: "spec.externalName"
                        },
                    ]
                },
            ]
        }
    }
}