import {Pod} from "store/resource/types/Pod.svelte.js";
import {Deployment} from "store/resource/types/Deployment.svelte.js";
import {Service} from "store/resource/types/Service.svelte.js";
import {Ingress} from "store/resource/types/Ingress.svelte.js";
import {Configmap} from "store/resource/types/Configmap.svelte.js";
import {Container} from "store/resource/types/Container.svelte.js";
import {Node} from "store/resource/types/Node.svelte.js";
import {Endpoints} from "store/resource/types/Endpoints.svelte.js";
import {eventBus} from "store/Common.svelte.js";
import {Namespace} from "store/resource/types/Namespace.svelte.js";
import {NodeMetrics} from "store/resource/types/NodeMetrics.svelte.js";
import {ReplicaSet} from "store/resource/types/ReplicaSet.svelte.js";
import {DaemonSetSet} from "store/resource/types/DaemonSet.svelte.js";
import {StatefulSet} from "store/resource/types/StatefulSet.svelte.js";
import {CronJob} from "store/resource/types/CronJob.svelte.js";
import {Secret} from "store/resource/types/Secret.svelte.js";
import {HorizontalPodAutoscaler} from "store/resource/types/HorizontalPodAutoscaler.svelte.js";
import {NetworkPolicy} from "store/resource/types/NetworkPolicy.svelte.js";
import {PersistentVolume} from "store/resource/types/PersistentVolume.svelte.js";
import {PersistentVolumeClaim} from "store/resource/types/PersistentVolumeClaim.svelte.js";
import {StorageClass} from "store/resource/types/StorageClass.svelte.js";
import {Role} from "store/resource/types/Role.svelte.js";
import {RoleBinding} from "store/resource/types/RoleBinding.svelte.js";
import {ServiceAccount} from "store/resource/types/ServiceAccount.svelte.js";
import {Job} from "store/resource/types/Job.svelte.js";
import {ClusterRole} from "store/resource/types/ClusterRole.svelte.js";
import {ClusterRoleBinding} from "store/resource/types/ClusterRoleBinding.svelte.js";
import {resourceContext} from "store/resource/ResourceContext.svelte.js";
import {cluster} from 'store/Cluster.svelte.js';
import {Utils} from "lib";

class DataRequest {
    constructor(url) {
        this.url = url;
    }

    async post(params = {}) {
        let response = await fetch(Utils.fixHost(this.url), {
            method: "post",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        });
        if (response.ok) {
            return await response.json();
        }
        return {code: 1, msg: "error"};
    }
}

class ResourceKeeper {
    constructor(url) {
        this.url = url;
        this.requester = new DataRequest(url);
        this.rawData = [];
        this.clusters = [];
    }

    loading = false;
    error = false;
    errorMsg = null;
    done = false;
    updated = $state(Date.now());

    async get(params = {}) {
        if (resourceContext.locked) {
            return;
        }
        if (!this.updated) {
            return;
        }
        if (this.done || this.loading) {
            return;
        }
        this.loading = true;
        let {code, data = [], msg} = await this.requester.post(params);
        if (code === 0) {
            this.error = false;
            this.loading = false;
            this.done = true;
        } else {
            this.error = true;
            this.errorMsg = msg;
            this.loading = false;
            this.done = false;
        }
        this._addOrReplace(data || []);
        this.updated = Date.now();
    }

    _addOrReplace(list = []) {
        (list || []).forEach(target => {
            let t = this.rawData.findIndex(a => {
                return a.metadata.name === target.metadata.name && a.metadata.namespace === target.metadata.namespace
            });
            if (t !== -1) {
                this.rawData[t] = target;
            } else {
                this.rawData.push(target);
            }
        });
        this.updated = Date.now();
    }

    getData() {
        return this.rawData;
    }

    reset() {
        this.done = false;
        this.loading = false;
        this.error = false;
        this.errorMsg = "";
        this.rawData = [];
        this.updated = Date.now();
    }

    reload() {
        this.reset();
        this.get();
    }

    update(target) {
        let t = this.rawData.findIndex(a => a.metadata.uid === target.metadata.uid);
        if (t !== -1) {
            this.rawData[t] = target;
        } else {
            this.rawData.push(target);
        }
        this.updated = Date.now();
    }

    delete(target) {
        this.rawData = this.rawData.filter(a => a.metadata.uid !== target.metadata.uid);
        this.updated = Date.now();
    }

    add(target) {
        this.update(target);
    }

    getByName(name) {
        return (this.rawData || []).find(item => item.metadata.name === name);
    }

    getByMatchLabels(matchLabels = {}) {
        return (this.rawData || []).filter(item => {
            return Object.keys(matchLabels).every(key => {
                return item.metadata?.labels?.[key] === matchLabels[key];
            });
        });
    }
}

class NamespaceResourceKeeper extends ResourceKeeper {
    constructor(url) {
        super(url);
    }

    async get(params) {
        if (!cluster.id) {
            return;
        }
        await super.get();
    }
}

class UnNamespacedResourceKeeper extends ResourceKeeper {
    constructor(url) {
        super(url);
    }

    async get(params) {
        if (cluster.id && !this.clusters.includes(cluster.id) && this.done) {
            this.clusters.push(cluster.id);
            this.reset();
        }
        await super.get();
    }
}

class NamespacedResourceKeeper extends ResourceKeeper {
    constructor(url) {
        super(url);
        this.namespaced = [];
    }

    async get(params) {
        if (resourceContext.toggling && this.done) {
            this.reset();
        }
        if (!resourceContext.namespace) {
            return;
        }
        if (!this.namespaced.includes(resourceContext.namespace)) {
            this.namespaced.push(resourceContext.namespace);
            this.done = false;
        }
        await super.get({namespace: resourceContext.namespace});
    }

    reset() {
        this.namespaced = [];
        super.reset();
    }

    getData() {
        if (resourceContext.namespace) {
            return this.rawData.filter(a => a.metadata.namespace === resourceContext.namespace);
        }
        return this.rawData;
    }

    getAllData() {
        return this.rawData;
    }
}

class ResourceKind {
    constructor(kind, url, handler, {type = 0, namespaced = true, object = false} = {}) {
        this.kind = kind;
        this.handler = handler;
        if (type === 0) {
            this.keeper = new NamespacedResourceKeeper(url);
        } else if (type === 1) {
            this.keeper = new UnNamespacedResourceKeeper(url);
        } else if (type === 2) {
            this.keeper = new NamespaceResourceKeeper(url);
        }
        this._dependence = null;
        this.namespaced = !['ClusterRole', 'ClusterRoleBinding', 'PersistentVolume', 'StorageClass', 'Node', 'Namespace'].includes(kind);
    }

    _getDependenceDark(visited = new Set()) {
        if (this._dependence) {
            return this._dependence;
        }
        if (visited.has(this)) {
            return [];
        }
        visited.add(this);

        let r = [this];
        this.getHandler(null).getDependence().forEach(a => {
            if (!r.includes(a)) {
                r.push(a);
                a._getDependenceDark(visited).forEach(b => {
                    if (b === this) {
                        return;
                    }
                    if (!r.includes(b)) {
                        r.push(b);
                    }
                });
            }
        });
        this._dependence = r;
        return this._dependence;
    }

    _getDependence() {
        return this._dependence;
    }

    get done() {
        return this.keeper.done;
    }

    getHandler(raw) {
        let t = new this.handler(raw, ResourceKinds);
        t.handleKind = this.kind;
        return t;
    }

    getRawList() {
        return this.keeper.getData();
    }

    getAllRawList() {
        if (this.keeper instanceof NamespacedResourceKeeper) {
            return this.keeper.getAllData();
        }
        return this.keeper.getData();
    }

    getList() {
        return this.keeper.getData().map(a => this.getHandler(a));
    }

    getAllList() {
        let r = this.keeper.getData();
        if (this.keeper instanceof NamespacedResourceKeeper) {
            r = this.keeper.getAllData();
        }
        return r.map(a => this.getHandler(a));
    }

    getDetailList() {
        return this.getList().map(a => a.getDetail());
    }

    getTableList() {
        return this.getList().map(a => a.getTableRow());
    }

    getByName(name) {
        return this.getAllList().find(item => {
            if (this.namespaced) {
                return item.name === name && item.namespace === resourceContext.namespace;
            } else {
                return item.name === name;
            }
        });
    }

    getRawByName(name) {
        return this.getAllRawList().find(item => {
            if (this.namespaced) {
                return item.metadata.name === name && item.metadata.namespace === resourceContext.namespace;
            } else {
                return item.metadata.name === name;
            }
        });
    }

    getByLabels(matchLabels = {}) {
        return this.getAllList().filter(item => {
            return Object.keys(matchLabels).every(key => {
                return item.labels?.[key] === matchLabels[key];
            });
        });
    }

    getRawByLabels(matchLabels = {}) {
        return this.getAllRawList().filter(item => {
            return Object.keys(matchLabels).every(key => {
                return item.metadata.labels?.[key] === matchLabels[key];
            });
        });
    }

    getRawBySelector(matchLabels = {}) {
        return this.getAllRawList().filter(item => {
            return Object.keys(matchLabels).every(key => {
                return item.spec.selector?.matchLabels?.[key] === matchLabels[key];
            });
        });
    }

    ready(fn) {
        if (resourceContext.locked) {
            return;
        }
        let dependence = this._getDependence();
        dependence.forEach(a => a.keeper.get());
        if (dependence.find(a => !a.keeper.done) === undefined) {
            fn && fn();
        }
    }

    waitUtil(fn) {
        if (resourceContext.locked) {
            return;
        }
        let dependence = this._getDependence();
        dependence.forEach(a => a.keeper.get())
        if (dependence.find(a => !a.keeper.done) === undefined) {
            fn && fn();
        } else {
            setTimeout(() => this.waitUtil(fn), 500);
        }
    }

    wait(fn) {
        if (resourceContext.locked) {
            return;
        }
        let dependence = this._getDependence();
        dependence.forEach(a => a.keeper.get())
        if (dependence.find(a => !a.keeper.done) === undefined) {
            fn && fn(true);
        } else {
            fn && fn(false);
        }
    }
}

const ResourceInitializer = {
    initialize() {
        Reflect.ownKeys(ResourceKinds).forEach(kind => ResourceKinds[kind]._getDependenceDark());
        eventBus.on("resourceUpdate", a => this.updateResource(a));
        eventBus.on('resetNamespace', () => {
            ResourceKinds.Namespace.keeper.reset();
            console.log('=> Namespace reset done');
        })
    },
    updateResource({kind, action, target}) {
        if (["MODIFIED", "ERROR", "BOOKMARK"].includes(action)) {
            ResourceKinds[kind]?.keeper.update(target);
        } else if (action === "DELETED") {
            ResourceKinds[kind]?.keeper.delete(target);
        } else if (action === "ADDED") {
            ResourceKinds[kind]?.keeper.add(target);
        }
    }
}

export const ResourceKinds = {
    Node: new ResourceKind("Node", "/kube/resource/Node", Node, {type: 1}),
    Namespace: new ResourceKind("Namespace", "/kube/resource/Namespace", Namespace, {type: 2}),
    Pod: new ResourceKind("Pod", "/kube/resource/Pod", Pod),
    Deployment: new ResourceKind("Deployment", "/kube/resource/Deployment", Deployment),
    Service: new ResourceKind("Service", "/kube/resource/Service", Service),
    Ingress: new ResourceKind("Ingress", "/kube/resource/Ingress", Ingress),
    Container: new ResourceKind("Container", "/kube/resource/Container", Container),
    ConfigMap: new ResourceKind("ConfigMap", "/kube/resource/ConfigMap", Configmap),
    Endpoints: new ResourceKind("Endpoints", "/kube/resource/Endpoints", Endpoints),
    NodeMetrics: new ResourceKind("NodeMetrics", "/kube/nodes/metrics", NodeMetrics, {type: 1}),
    ReplicaSet: new ResourceKind("ReplicaSet", "/kube/resource/ReplicaSet", ReplicaSet),
    DaemonSet: new ResourceKind("DaemonSet", "/kube/resource/DaemonSet", DaemonSetSet),
    StatefulSet: new ResourceKind("StatefulSet", "/kube/resource/StatefulSet", StatefulSet),
    CronJob: new ResourceKind("CronJob", "/kube/resource/CronJob", CronJob),
    Job: new ResourceKind("Job", "/kube/resource/Job", Job),
    Secret: new ResourceKind("Secret", "/kube/resource/Secret", Secret),
    HorizontalPodAutoscaler: new ResourceKind("HorizontalPodAutoscaler", "/kube/resource/HorizontalPodAutoscaler", HorizontalPodAutoscaler),
    NetworkPolicy: new ResourceKind("NetworkPolicy", "/kube/resource/NetworkPolicy", NetworkPolicy),
    PersistentVolume: new ResourceKind("PersistentVolume", "/kube/resource/PersistentVolume", PersistentVolume, {type: 1}),
    PersistentVolumeClaim: new ResourceKind("PersistentVolumeClaim", "/kube/resource/PersistentVolumeClaim", PersistentVolumeClaim),
    StorageClass: new ResourceKind("StorageClass", "/kube/resource/StorageClass", StorageClass, {type: 1}),
    Role: new ResourceKind("Role", "/kube/resource/Role", Role),
    RoleBinding: new ResourceKind("RoleBinding", "/kube/resource/RoleBinding", RoleBinding),
    ServiceAccount: new ResourceKind("ServiceAccount", "/kube/resource/ServiceAccount", ServiceAccount),
    ClusterRole: new ResourceKind("ClusterRole", "/kube/resource/ClusterRole", ClusterRole, {type: 1}),
    ClusterRoleBinding: new ResourceKind("ClusterRoleBinding", "/kube/resource/ClusterRoleBinding", ClusterRoleBinding, {type: 1}),
    ServiceAccountAll: new ResourceKind("ServiceAccountAll", "/kube/resource/ServiceAccount", ServiceAccount, {type: 1}),
};

ResourceInitializer.initialize();