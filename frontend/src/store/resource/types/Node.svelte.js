import {Resource} from "store/resource/Resource.svelte.js";
import DownloadIcon from "components/icons/DownloadIcon.svelte";
import DeleteIcon from "components/icons/DeleteIcon.svelte";
import PodsLite from "components/PodsLite.svelte";
import Table from "components/Table.svelte";
import NodeDetailComponent from "components/detail/component/NodeDetailComponent.svelte";
import {KubeUtils} from "store/KubeUtils.svelte.js";

export class Node extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.Pod, this.resources.NodeMetrics];
    }

    getStatus() {
        const node = this.raw;
        const conditions = node.status?.conditions || [];
        const annotations = node.metadata?.annotations || {};
        const readyCondition = conditions.find(c => c.type === 'Ready');
        const memoryPressure = conditions.find(c => c.type === 'MemoryPressure');
        const diskPressure = conditions.find(c => c.type === 'DiskPressure');
        const pidPressure = conditions.find(c => c.type === 'PIDPressure');
        const statusChecks = [
            {
                check: () => !!node.metadata.deletionTimestamp,
                status: 'Terminating',
                className: 'terminating',
                description: `Node is terminating, expected completion time: ${calcTimeRemaining(node.metadata.deletionTimestamp)}`
            },
            {
                check: () => annotations['cattle.io/status']?.includes('provisioning'),
                status: 'Provisioning',
                className: 'provisioning',
                description: 'Node resources are being created, waiting for cloud provider to allocate infrastructure'
            },
            {
                check: () => annotations['cattle.io/status']?.includes('initializing'),
                status: 'Initializing',
                className: 'initializing',
                description: 'Installing Kubernetes components (kubelet, CNI, CSI, etc.)'
            },
            {
                check: () => readyCondition?.status === 'False' && readyCondition.reason === 'KubeletNotReady',
                status: 'Error',
                className: 'error',
                description: `Kubelet error: ${readyCondition.message} (last heartbeat: ${formatTime(readyCondition.lastHeartbeatTime)})`
            },
            {
                check: () => [memoryPressure, diskPressure, pidPressure].some(p => p?.status === 'True'),
                status: 'Unavailable',
                className: 'unavailable',
                description: `Resource pressure: ${
                    [memoryPressure, diskPressure, pidPressure]
                        .filter(p => p?.status === 'True')
                        .map(p => `${p.type} (${p.reason})`)
                        .join(', ')
                }`
            },
            {
                check: () => node.metadata.annotations?.['kubectl.kubernetes.io/draining'] === 'true',
                status: 'Draining',
                className: 'draining',
                description: `Evicting pods, ${getEvictedPodCount(node)} pods evicted`
            },
            {
                check: () => node.spec.unschedulable === true,
                status: 'Cordoned',
                className: 'cordoned',
                description: 'Node is cordoned, no new pods will be scheduled'
            },
            {
                check: () => readyCondition?.status === 'Unknown' && calcDuration(readyCondition.lastHeartbeatTime) > 5,
                status: 'Disconnected',
                className: 'disconnected',
                description: `Node disconnected (last seen: ${formatTime(readyCondition.lastHeartbeatTime)})`
            },
            {
                check: () => readyCondition?.status === 'True',
                status: 'Active',
                className: 'active',
                description: `Node is active, ready for ${calcDuration(readyCondition.lastTransitionTime)} minutes`
            },
            {
                check: () => true,
                status: 'Unknown',
                className: 'unknown',
                description: 'Node status unknown, check API data'
            }
        ];

        function calcDuration(timestamp) {
            if (!timestamp) return 'N/A';
            const diff = Date.now() - new Date(timestamp).getTime();
            return Math.floor(diff / 1000 / 60); // 返回分钟数
        }

        function formatTime(timestamp) {
            return new Date(timestamp).toLocaleTimeString();
        }

        function calcTimeRemaining(deletionTimestamp) {
            if (!deletionTimestamp) return 'N/A';
            const gracePeriod = node.metadata.deletionGracePeriodSeconds || 30;
            const endTime = new Date(deletionTimestamp).getTime() + gracePeriod * 1000;
            return Math.ceil((endTime - Date.now()) / 1000) + ' 秒';
        }

        function getEvictedPodCount(node) {
            return node.metadata.annotations?.['kubectl.kubernetes.io/evicted-pods']?.split(',').length || 0;
        }

        const matched = statusChecks.find(s => s.check());
        return {
            status: matched.status,
            className: `status-${matched.className}`,
            description: matched.description
        };
    }

    getTableRow() {
        let pods = this.resources.Pod.getAllRawList();
        const nodeMetrics = this.resources.NodeMetrics.getAllRawList();
        const node = this.raw;
        let stats = {
            cpuTotal: KubeUtils.unitConvert.cpu.parse(node.status.capacity?.cpu || '0'),
            cpuUsed: 0,
            cpuPercent: 0,
            memoryTotal: KubeUtils.unitConvert.memory.parse(node.status.capacity?.memory || '0'),
            memoryUsed: 0,
            memoryPercent: 0,
            podTotal: node.status.capacity.pods,
            podCount: 0,
            podPercent: 0
        };
        const name = node.metadata.name;

        const metrics = nodeMetrics.find(m => m.metadata.name === name);
        if (metrics) {
            stats.cpuUsed = KubeUtils.unitConvert.cpu.parse(metrics.usage.cpu || '0');
            stats.memoryUsed = KubeUtils.unitConvert.memory.parse(metrics.usage.memory || '0');
        }
        pods.forEach(pod => {
            if (pod.spec.nodeName === name) {
                stats.podCount++;
            }
        });
        stats.cpuPercent = KubeUtils.unitConvert.format((stats.cpuUsed / stats.cpuTotal) * 100);
        stats.memoryPercent = KubeUtils.unitConvert.format((stats.memoryUsed / stats.memoryTotal * 100));
        stats.podPercent = KubeUtils.unitConvert.format((stats.podCount / stats.podTotal) * 100);
        stats.cpuUsed = KubeUtils.unitConvert.format(stats.cpuUsed);
        stats.memoryUsed = KubeUtils.unitConvert.format(stats.memoryUsed);
        stats.podCount = KubeUtils.unitConvert.format(stats.podCount);
        stats.podTotal = KubeUtils.unitConvert.format(stats.podTotal);
        stats.memoryTotal = KubeUtils.unitConvert.format(stats.memoryTotal);
        stats.cpuTotal = KubeUtils.unitConvert.format(stats.cpuTotal);
        let a = {
            id: name,
            status: this.getStatus(),
            name: name,
            roles: this.getNodeRoles().join(', '),
            version: node.status.nodeInfo?.kubeletVersion || 'Unknown',
            ip: this.getNodeIPs(),
            os: node.status.nodeInfo?.operatingSystem || 'Unknown',
            cpu: stats,
            ram: stats,
            pods: stats,
            age: this.age,
            taint: {
                items: (node.spec?.taints || []).map(a => `${a.effect}:${a.key}=${a.value}`),
            }
        };
        if (a.status.message && a.status.status !== 'Active') {
            a.rowOption = {className: 'row-desc'};
            a.showDescription = true;
        }
        if (a.taint.items.length > 0) {
            a.rowOption = {className: 'row-desc'};
        }
        return a;
    }

    getNodeRoles() {
        let node = this.raw;
        return Object.keys(node.metadata.labels || {})
            .filter(key => key.startsWith('node-role.kubernetes.io/'))
            .map(key => key.split('/')[1]);
    }

    getNodeIPs() {
        let node = this.raw;
        const addresses = node.status.addresses || [];
        const external = addresses.find(a => a.type === 'ExternalIP')?.address || '';
        const internal = addresses.find(a => a.type === 'InternalIP')?.address || '';
        return `${internal}`;
    }


    getTableHeader() {
        return [
            {name: "State", key: "status", align: "left", width: "100px"},
            {name: "Name", key: "name", align: "left", sortable: true, sorted: "asc"},
            {name: "Roles", key: "roles", align: "left", width: "100px"},
            {name: "Version", key: "version", align: "left", width: "70px"},
            {name: "Internal IP ", key: "ip", align: "center", width: "200px"},
            {name: "OS ", key: "os", align: "left", width: "80px"},
            {name: "CPU ", key: "cpu", align: "center", width: "140px"},
            {name: "RAM ", key: "ram", align: "center", width: "140px"},
            {name: "Pods", key: "pods", align: "center", width: "140px"},
            {name: "Age", key: "age", align: "right", width: "100px", sortable: true}
        ]
    }

    getTableButtons() {
        return [
            {
                label: 'Cordon',
                icon: DownloadIcon,
                action: (ids) => {
                }
            },
            {
                label: 'Drain',
                icon: DownloadIcon,
                action: (ids) => {
                }
            },
            {
                label: 'Download YAML',
                icon: DownloadIcon,
                action: (ids) => {
                }
            },
            {
                label: 'Delete',
                icon: DeleteIcon,
                action: (ids) => {
                    console.log(ids);
                }
            }
        ]
    }

    getCreatable() {
        return null;
    }

    getIntro(resource) {
        return [
            {key: "External IP", value: "--"},
            {key: "Internal IP", value: "--"},
            {key: "Version", value: resource.status.nodeInfo.kubeletVersion},
            {key: "OS", value: resource.status.nodeInfo.osImage},
            {key: "Container Runtime", value: resource.status.nodeInfo?.containerRuntimeVersion?.split('/').pop()},
        ];
    }

    getDetailTabs(pod) {
        return [
            {
                id: "pods",
                title: "Pods",
                component: PodsLite,
                params: {
                    params: {
                        nodeName: pod.metadata.name
                    }
                }
            },
            {
                id: "info",
                title: "Info",
                component: Table,
                params: {
                    header: [
                        {name: "Prop", key: "prop", align: "left"},
                        {name: "Value", key: "value", align: "left"},
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: Reflect.ownKeys((pod.status.nodeInfo || {})).map(a => {
                        return {prop: a, value: pod.status.nodeInfo[a]};
                    })
                }
            },
            {
                id: "images",
                title: "Image",
                component: Table,
                params: {
                    header: [
                        {name: "Name", key: "name", align: "left"},
                        {name: "Size", key: "size", align: "left"},
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: (pod.status.images || []).map(a => {
                        return {name: a.names.join(';'), size: KubeUtils.formatBytes(a.sizeBytes)};
                    })
                }
            },
            {
                id: "taint",
                title: "Taint",
                component: Table,
                params: {
                    header: [
                        {name: "Key", key: "key", align: "left"},
                        {name: "Value", key: "value", align: "left"},
                        {name: "Effect", key: "effect", align: "left"},
                    ],
                    buttons: [],
                    menus: [],
                    checkbox: false,
                    data: pod.spec.taints || []
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
                    data: pod.status.conditions || []
                }
            }
        ]
    }

    getDetailComponents(resourceKind) {
        return [
            {component: NodeDetailComponent, params: {node: resourceKind}}
        ];
    }
}