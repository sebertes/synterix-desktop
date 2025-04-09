import {browser} from "$app/environment";
import {goto} from "$app/navigation";
import {KubeService} from "store/KubeService.svelte.js";
import {cluster} from "store/Cluster.svelte.js";

class MenuProvider {
    list = $state([
        {
            id: "cluster",
            name: "Cluster",
            open: true,
            href: "/statistics",
            admin: true,
            list: [
                {id: "namespaces", kind: "Namespace", name: "Namespaces", num: 0, admin: true},
                {id: "nodes", kind: "Node", name: "Nodes", num: 0, admin: true},
            ]
        },
        {
            id: "workload",
            name: "Workload",
            open: true,
            list: [
                {id: "deployments", kind: "Deployment", name: "Deployments", num: 0},
                {id: "pods", kind: "Pod", name: "Pods", num: 0},
                {id: "statefulSets", kind: "StatefulSet", name: "StatefulSets", num: 0},
                {id: "replicaSets", kind: "ReplicaSet", name: "ReplicaSets", num: 0},
                {id: "daemonSets", kind: "DaemonSet", name: "DaemonSets", num: 0},
                {id: "cronJobs", kind: "CronJob", name: "CronJobs", num: 0},
                {id: "jobs", kind: "Job", name: "Jobs", num: 0}
            ]
        },
        {
            id: "servicediscory",
            name: "Service Discovery",
            open: true,
            list: [
                {id: "services", kind: "Service", name: "Services", num: 0},
                {id: "ingresses", kind: "Ingress", name: "Ingresses", num: 0},
                {id: "networkPolicies", name: "NetworkPolicies", num: 0, kind: "NetworkPolicy"},
                {
                    id: "horizontalPodAutoScalers",
                    name: "HorizontalPodAutoscalers",
                    num: 0,
                    kind: "HorizontalPodAutoscaler"
                },
            ]
        },
        {
            id: "storage",
            name: "Storage",
            open: true,
            list: [
                {id: "configmaps", name: "ConfigMaps", num: 0, kind: "ConfigMap"},
                {id: "pvc", name: "PersistentVolumeClaims", num: 0, kind: "PersistentVolumeClaim"},
                {id: "persistentVolumes", name: "PersistentVolume", num: 0, kind: "PersistentVolume", admin: true},
                {id: "storageClasses", name: "StorageClasses", num: 0, kind: "StorageClass", admin: true},
                {id: "secrets", name: "Secrets", num: 0, kind: "Secret"},
            ]
        },
        {
            id: "rbac",
            name: "RBAC",
            open: true,
            list: [
                {id: "roles", name: "Roles", num: 0, kind: "Role"},
                {id: "roleBindings", name: "RoleBindings", num: 0, kind: "RoleBinding"},
                {id: "clusterRoles", name: "ClusterRoles", num: 0, kind: "ClusterRole", admin: true},
                {
                    id: "clusterRoleBindings",
                    name: "ClusterRoleBindings",
                    num: 0,
                    kind: "ClusterRoleBinding",
                    admin: true
                },
                {id: "serviceAccounts", name: "ServiceAccounts", num: 0, kind: "ServiceAccount"}
            ]
        }
    ]);

    toggleMenu(id) {
        let t = this.list.find(a => a.id === id);
        if (t) {
            t.open = !t.open;
        }
    }

    openFirst(id) {
        let t = this.list.find(a => a.id === id);
        if (t) {
            t.open = true;
            if (browser) {
                if (!t.href) {
                    goto('/dashboard/' + cluster.path + '/resource/' + t.list[0].kind);
                } else {
                    goto('/dashboard/' + cluster.path + '/resource/' + t.list[0].href);
                }
            }
        }
    }

    updateCount(namespace) {
        KubeService.resourceCount.post({namespace}).then(({data}) => {
            this.list.forEach(a => {
                a.list.forEach(b => {
                    b.num = data[b.kind] || 0;
                })
            })
        })
    }
}

export const menuProvider = new MenuProvider();