import {eventBus} from "store/Common.svelte.js";

class Cluster {
    id = $state(null);
    type = $state(null);
    name = $state(null);
    auth = $state(null);
    version = $state(null);
    edgeId = $state(null);

    get path() {
        return this.id;
    }

    set(cluster) {
        this.type = cluster.type;
        this.name = cluster.type === 'admin' ? 'central' : cluster.name;
        this.id = cluster.clusterId;
        this.version = cluster.kubeVersion;
        this.auth = cluster.kubeAuth;
        this.edgeId = cluster.edgeId;
    }

    isAdmin() {
        return this.auth === 'admin';
    }
}

export const cluster = new Cluster();