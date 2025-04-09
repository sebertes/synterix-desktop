import Table from "components/Table.svelte";
import {Resource} from "store/resource/Resource.svelte.js";
import ContainerList from "components/ContainerList.svelte";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import {KubeUtils} from "store/KubeUtils.svelte.js";

export class Pod extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getStatus() {
        let pod = this.raw;
        const status = pod.status;
        const metadata = pod.metadata;
        const spec = pod.spec;

        if (metadata.deletionTimestamp) {
            return {
                status: 'Terminating',
                className: 'status-terminating',
                description: 'Pod is being deleted but has not yet fully terminated. It may be stuck due to unfinished finalizers or API communication failure'//'Pod 正在删除，但尚未完全终止。可能因 Finalizers 未完成或 API 通信故障卡住。'
            };
        }
        if (status.reason === 'Evicted') {
            return {
                status: 'Evicted',
                className: 'status-evicted',
                description: 'Pod was evicted due to insufficient node resources (e.g., memory or disk pressure). Clean up the node or adjust resource requests.'
            };
        }
        if (spec.initContainers) {
            const initStatuses = status.initContainerStatuses || [];
            const total = spec.initContainers.length;
            const ready = initStatuses.filter(s => s.state.terminated?.exitCode === 0).length;

            if (ready < total) {
                const currentInit = initStatuses.find(s =>
                    s.state.waiting || s.state.running || s.state.terminated?.exitCode !== 0
                );

                let initState = 'Init';
                if (currentInit?.state.waiting?.reason) {
                    initState += `:${currentInit.state.waiting.reason}`;
                } else if (currentInit?.state.terminated?.exitCode !== 0) {
                    initState += `:Error`;
                } else {
                    initState += `:${ready}/${total}`;
                }

                return {
                    status: initState,
                    className: 'status-init',
                    description: `Init containers not completed (${ready}/${total}). Failure reason: ${currentInit?.state.waiting?.reason || 'Check logs'}.`
                };
            }
        }
        const containerStatuses = status.containerStatuses || [];
        for (const cs of containerStatuses) {
            const state = cs.state || {};
            if (state.waiting?.reason === 'CrashLoopBackOff') {
                return {
                    status: 'CrashLoopBackOff',
                    className: 'status-crashloop',
                    description: `Container crashes and restarts frequently (restart count: ${cs.restartCount}). Check app errors or dependencies.`
                };
            }
            if (state.waiting?.reason === 'ImagePullBackOff' || state.waiting?.reason === 'ErrImagePull') {
                return {
                    status: state.waiting.reason,
                    className: 'status-image-error',
                    description: `Image pull failed: ${state.waiting.message || 'Check image name/permissions/network'}`
                };
            }
            if (state.terminated?.reason === 'OOMKilled') {
                return {
                    status: 'OOMKilled',
                    className: 'status-oom',
                    description: `Container terminated due to memory limit. Adjust memory limits or optimize app.`
                };
            }
            if ((state.terminated?.exitCode && state.terminated?.exitCode !== 0) && !state.running) {
                return {
                    status: 'Error',
                    className: 'status-error',
                    description: `Container exited abnormally (exit code: ${state.terminated?.exitCode}). Error message: ${state.terminated?.message}`
                };
            }
        }
        switch (status.phase) {
            case 'Pending':
                const unschedulable = status.conditions?.find(c =>
                    c.reason === 'Unschedulable' && c.status === 'False'
                );
                if (unschedulable) {
                    return {
                        status: 'Unschedulable',
                        className: 'status-unschedulable',
                        description: `Cannot schedule to node: ${unschedulable.message}. Check resources, affinity rules, or taint config.`
                    };
                }
                return {
                    status: 'Pending',
                    className: 'status-pending',
                    description: 'Waiting for scheduling or container creation. Check resource availability, image download speed, or init container completion.'
                };

            case 'Running':
                const allReady = containerStatuses.every(cs => cs.ready);
                return {
                    status: allReady ? 'Running' : 'Running(Not Ready)',
                    className: allReady ? 'status-running' : 'status-running-warning',
                    description: allReady ? 'Container is running and passed readiness probe.'
                        : 'Container is running but not ready, possibly starting or misconfigured.'
                };

            case 'Succeeded':
                return {
                    status: 'Succeeded',
                    className: 'status-succeeded',
                    description: 'Container completed task and exited. Common in Job/CronJob.'
                };

            case 'Failed':
                return {
                    status: 'Failed',
                    className: 'status-failed',
                    description: 'At least one container exited abnormally (non-zero exit code). Check container logs.'
                };

            default:
                return {
                    status: 'Unknown',
                    className: 'status-unknown',
                    description: 'Pod status unknown, possibly node disconnected or control plane communication failure.'
                };
        }
    }

    getCreatable() {
        return null;
    }

    getTableRow() {
        let pod = this.raw;
        const containerStatuses = pod.status.containerStatuses || [];
        const totalContainers = containerStatuses.length;
        const readyContainers = containerStatuses.filter(status => status.ready).length;
        const restarts = containerStatuses.reduce((sum, status) => sum + status.restartCount, 0);
        const status = this.getStatus();
        let t = pod.metadata.name.split('-');
        t.pop();
        let item = {
            id: pod.metadata.name || 'Unknown',
            status,
            name: pod.metadata.name || 'Unknown',
            workload: t.join('-'),
            namespace: pod.metadata.namespace || 'Unknown',
            image: containerStatuses.map(status => status.image).join(', ') || 'Unknown',
            ready: `${readyContainers}/${totalContainers}`,
            restarts: restarts,
            ip: pod.status.podIP || 'Unknown',
            node: pod.spec.nodeName || 'Unknown',
            age: KubeUtils.formatAge(pod.metadata.creationTimestamp),
            containers: containerStatuses
        };
        if (item.status.status !== 'Running' && item.status.description) {
            item.rowOption = {className: 'row-desc'};
            item.status.showDescription = true;
        }
        return item;
    }

    getContainerTableData() {
        let pod = this.raw;
        return pod.status.containerStatuses.map(a => {
            a.namespace = pod.metadata.namespace;
            a.podName = pod.metadata.name;
            return this.resources.Container.getHandler(a).getTableRow();
        });
    }

    getTableHeader() {
        return [
            {name: "State", key: "status", align: "left", width: "100px"},
            {name: "Name", key: "name", align: "left", width: "200px", sortable: true, sorted: "asc"},
            {name: "Namespace", key: "namespace", align: "left", width: "100px"},
            {name: "Image", key: "image", align: "left"},
            {name: "Ready", key: "ready", align: "center", width: "80px", sortable: true},
            {name: "Restarts", key: "restarts", align: "center", width: "80px"},
            {name: "IP", key: "ip", align: "center", width: "100px"},
            {name: "Node", key: "node", align: "center", width: "150px"},
            {name: "Age", key: "age", align: "center", width: "100px", sortable: true}
        ];
    }

    getActions() {
        return [
            'Detail',
            'Yaml',
            'ExecuteShell',
            'ViewLog',
            'line',
            'EditYaml',
            'CloneYaml',
            'line',
            'Download',
            'Delete',
            'Proxy'
        ]
    }

    getIntro(resource) {
        let t = resource.metadata.name.split('-');
        t.pop();
        return [
            {key: "Pod Ip", value: resource.status.podIP || 'Unknown'},
            {key: "Workload", value: t.join('-')},
            {key: 'Node', value: resource.spec.nodeName || 'Unknown'}
        ];
    }

    getDetailTabs(resource) {
        return [
            {
                id: "containers",
                title: "Containers",
                component: ContainerList,
                params: {
                    params: {
                        podName: resource.metadata.name
                    }
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
                    data: resource.status.conditions || []
                }
            },
            {
                id: "refers",
                title: "Related Resources",
                component: ResourceRefers,
                params: {
                    name: resource.metadata.name,
                    namespace: resource.metadata.namespace,
                    kind: resource.kind,
                }
            }
        ];
    }

    getDetailComponents(resourceKind) {
        return [];
    }
}