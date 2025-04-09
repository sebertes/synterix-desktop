import {Deployment} from "store/resource/types/Deployment.svelte.js";

export class ReplicaSet extends Deployment {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getDependence() {
        return [this.resources.Pod];
    }

    getStatus() {
        const rs = this.raw;
        const spec = rs.spec || {};
        const status = rs.status || {};
        const metadata = rs.metadata || {};
        if (metadata.deletionTimestamp) {
            return {
                status: 'Terminating',
                className: 'status-terminating',
                description: `ReplicaSet is being deleted. ${status.replicas || 0} pod(s) remaining.`
            };
        }
        if (spec.replicas === 0) {
            return {
                status: 'Inactive',
                className: 'status-inactive',
                description: 'ReplicaSet is scaled to 0 pods. No instances are running.'
            };
        }
        if (status.conditions?.some(c => c.type === 'ReplicaFailure' && c.status === 'True')) {
            return {
                status: 'Failed',
                className: 'status-failed',
                description: `Critical failure: ${status.conditions.find(c => c.type === 'ReplicaFailure').description}`
            };
        }
        if (status.availableReplicas !== status.replicas) {
            return {
                status: 'Degraded',
                className: 'status-degraded',
                description: `${status.availableReplicas || 0}/${spec.replicas} pods available. Check pod health.`
            };
        }
        if (status.observedGeneration < metadata.generation) {
            return {
                status: 'Progressing',
                className: 'status-progressing',
                description: `New configuration (generation ${metadata.generation}) is being applied. Current ready: ${status.readyReplicas || 0}`
            };
        }
        if (metadata.annotations?.['deployment.kubernetes.io/paused'] === 'true') {
            return {
                status: 'Paused',
                className: 'status-paused',
                description: 'Updates are paused. Resume to continue configuration changes.'
            };
        }
        if (status.readyReplicas === spec.replicas && status.replicas === spec.replicas) {
            return {
                status: 'Active',
                className: 'status-active',
                description: `${spec.replicas} pods fully operational and passing health checks`
            };
        }
        return {
            status: 'Unknown',
            className: 'status-unknown',
            description: 'Unexpected state. Check Kubernetes events for details.'
        };
    }

    getTableRow() {
        let deployment = this.raw;
        const metadata = deployment.metadata || {};
        const spec = deployment.spec || {};
        const status = deployment.status || {};

        const pods = this.resources.Pod.getRawByLabels(deployment.spec.selector.matchLabels);
        const podStatuses = pods.map(pod => this.resources.Pod.getHandler(pod).getStatus());
        const runningPods = podStatuses.filter(s => s.status === 'Running').length;
        const podStatusMap = {};
        podStatuses.forEach(a => {
            if (!podStatusMap[a.status]) {
                podStatusMap[a.status] = {size: 0, total: podStatuses.length, status: a.status, raw: a};
            }
            podStatusMap[a.status].size += 1;
        });
        const podStatusList = Reflect.ownKeys(podStatusMap).map(a => {
            return {
                size: podStatusMap[a].size,
                total: podStatusMap[a].total,
                status: podStatusMap[a].status,
                className: podStatusMap[a].raw.className,
                sort: podStatusMap[a].raw.sort,
                ratio: Math.round(podStatusMap[a].size / podStatusMap[a].total * 100)
            };
        }).sort((a, b) => {
            return b.sort - a.sort;
        });
        const podReadyRatio = pods.length > 0 ? Math.round(runningPods / pods.length * 100) : 0;

        let item = {
            id: metadata.name,
            name: metadata.name || "",
            namespace: metadata.namespace || "",
            image: spec.template?.spec?.containers?.[0]?.image || "",
            ready: status.readyReplicas || 0,
            current: status.availableReplicas || 0,
            desired: spec.replicas || 0,
            publicEndpoints: this._getPublicEndpoints(metadata.annotations || {}),
            status: this.getStatus(),
            age: this.age
        };
        item.status.podStatusList = podStatusList;
        item.status.podReadyRatio = podReadyRatio;
        if (item.status.status !== 'Active' && item.status.message) {
            item.rowOption = {className: 'row-desc'};
            item.status.showDescription = true;
        }
        return item;
    }

    _getPublicEndpoints(annotations) {
        if (!annotations["field.cattle.io/publicEndpoints"]) {
            return [];
        }
        try {
            return JSON.parse(annotations["field.cattle.io/publicEndpoints"]);
        } catch (e) {
            return [];
        }
    }

    getTableHeader() {
        return [
            {name: "State", key: "status", align: "left", width: "100px"},
            {name: "Name", key: "name", align: "left", width: "130px", sortable: true, sorted: "asc"},
            {name: "Namespace", key: "namespace", align: "left", width: "100px"},
            {name: "Image", key: "image", align: "left"},
            {name: "Endpoints", key: "publicEndpoints", align: "left", width: "110px"},
            {name: "Ready", key: "ready", align: "center", width: "100px"},
            {name: "Current", key: "current", align: "center", width: "80px", sortable: true},
            {name: "Desired", key: "desired", align: "center", width: "80px"},
            {name: "Health", key: "health", align: "center", width: "150px"}
        ];
    }
}