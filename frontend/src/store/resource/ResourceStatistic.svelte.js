import {ResourceKinds} from "store/resource/ResourceProvider.svelte.js";
import {KubeUtils} from "store/KubeUtils.svelte.js";

export const ResourceStatistic = {
    _getDependence() {
        let dependence = [];
        [ResourceKinds.Pod, ResourceKinds.Node, ResourceKinds.NodeMetrics, ResourceKinds.Deployment].forEach(a => {
            a._getDependence().forEach(a => {
                if (!dependence.includes(a)) {
                    dependence.push(a);
                }
            })
        });
        return dependence;
    },
    ready(fn) {
        let dependence = this._getDependence();
        dependence.forEach(a => a.keeper.get())
        if (dependence.find(a => !a.keeper.done) === undefined) {
            fn && fn();
        }
    },
    getClusterStatistic() {
        let nodes = ResourceKinds.Node.getAllRawList();
        let pods = ResourceKinds.Pod.getAllRawList();
        let nodesMetrics = ResourceKinds.NodeMetrics.getAllRawList();
        let deployments = ResourceKinds.Deployment.getAllRawList();
        const stats = {
            age: null,
            cpu: {capacity: 0, usage: 0, allocatable: 0, reserved: 0, percent: 0, reservedPercent: 0},
            memory: {capacity: 0, usage: 0, allocatable: 0, reserved: 0, percent: 0, reservedPercent: 0},
            pods: {total: pods.length, capacity: 0, percent: 0},
            deployments: {total: deployments.length},
            nodes: {total: nodes.length},
            version: nodes[0]?.status.nodeInfo.kubeletVersion
        };
        let nodeList = nodes;
        let oldestTime = null;
        nodeList = nodeList.filter(a => {
            if (!oldestTime) {
                oldestTime = new Date(a.metadata.creationTimestamp);
            } else if (new Date(a.metadata.creationTimestamp) < oldestTime) {
                oldestTime = new Date(a.metadata.creationTimestamp);
            }
            return a.metadata.labels['node-role.kubernetes.io/worker'] === 'true';
        });
        stats.age = KubeUtils.formatAge(new Date(oldestTime).toISOString());
        nodeList.forEach(node => {
            stats.cpu.capacity += KubeUtils.unitConvert.cpu.parse(node.status.capacity?.cpu || '0');
            stats.cpu.allocatable += KubeUtils.unitConvert.cpu.parse(node.status.allocatable?.cpu || '0');
            stats.memory.capacity += KubeUtils.unitConvert.memory.parse(node.status.capacity?.memory || '0');
            stats.memory.allocatable += KubeUtils.unitConvert.memory.parse(node.status.allocatable?.memory || '0');
            stats.pods.capacity += parseInt(node.status.capacity?.pods || '0');
        });
        pods.forEach(pod => {
            pod.spec.containers.forEach(container => {
                if (container.resources && container.resources.requests) {
                    if (container.resources.requests.cpu) {
                        stats.cpu.reserved += KubeUtils.unitConvert.cpu.parse(container.resources.requests.cpu);
                    }
                    if (container.resources.requests.memory) {
                        stats.memory.reserved += KubeUtils.unitConvert.memory.parse(container.resources.requests.memory);
                    }
                }
            });
        });
        nodesMetrics.forEach(metric => {
            stats.cpu.usage += KubeUtils.unitConvert.cpu.parse(metric.usage?.cpu || '0');
            stats.memory.usage += KubeUtils.unitConvert.memory.parse(metric.usage?.memory || '0');
        });
        if (stats.cpu.capacity) {
            stats.cpu.percent = KubeUtils.unitConvert.format((stats.cpu.usage / stats.cpu.capacity) * 100);
        }
        if (stats.memory.capacity) {
            stats.memory.percent = KubeUtils.unitConvert.format((stats.memory.usage / stats.memory.capacity) * 100);
        }
        if (stats.cpu.allocatable) {
            stats.cpu.reservedPercent = KubeUtils.unitConvert.format((stats.cpu.reserved / stats.cpu.allocatable) * 100);
        }
        if (stats.memory.allocatable) {
            stats.memory.reservedPercent = KubeUtils.unitConvert.format((stats.memory.reserved / stats.memory.allocatable) * 100);
        }
        if (stats.pods.capacity) {
            stats.pods.percent = KubeUtils.unitConvert.format((stats.pods.total / stats.pods.capacity) * 100);
        }
        stats.memory.capacity = KubeUtils.unitConvert.format(stats.memory.capacity);
        stats.memory.usage = KubeUtils.unitConvert.format(stats.memory.usage);
        stats.memory.allocatable = KubeUtils.unitConvert.format(stats.memory.allocatable);
        stats.memory.reserved = KubeUtils.unitConvert.format(stats.memory.reserved);
        stats.cpu.capacity = KubeUtils.unitConvert.format(stats.cpu.capacity);
        stats.cpu.usage = KubeUtils.unitConvert.format(stats.cpu.usage);
        stats.cpu.allocatable = KubeUtils.unitConvert.format(stats.cpu.allocatable);
        stats.cpu.reserved = KubeUtils.unitConvert.format(stats.cpu.reserved);
        return stats;
    }
}