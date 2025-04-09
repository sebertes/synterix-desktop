import {KubeSocket} from "lib/socket.js";
import {eventBus} from "store/Common.svelte.js";

class ResourceContext {
    constructor() {
        this._socketClosed = false;
        this._tunnelToggled = false;
        this.client = null;
        this.socket = new KubeSocket(() => '/kube/ws');
        this.socket.on("connected", () => this.netState = "connected");
        this.socket.on("reconnect", () => this.netState = "reconnect");
        this.socket.on("error", () => this.netState = "error");
        this.socket.on("closed", () => this.netState = "closed");
        eventBus.on('tunnelToggled', () => {
            if (this.toggling && !this._tunnelToggled) {
                this._tunnelToggled = true;
            }
        })
        eventBus.on("socketClosed", () => {
            if (this.toggling && !this._socketClosed) {
                this._socketClosed = true;
            }
        })
    }

    namespace = $state(null);
    locked = $state(false);
    ready = $state(false);
    toggling = $state(false);
    netState = $state("");

    async toggleCluster() {
        if (!this.toggling) {
            this._socketClosed = false;
            this._tunnelToggled = false;
            this.ready = false;
            this.toggling = true;
            this.locked = true;
            this.namespace = null;
            if (this.client) {
                this.client.dispose();
                this.client = null;
            }
            await this.socket.close();
            eventBus.emit("resetNamespace");
            console.log('=> Reset local cache');
            this.checkToggleReady();
        }
    }

    async checkToggleReady() {
        if (this.toggling && this._tunnelToggled && this._socketClosed) {
            if (this.toggling) {
                this.locked = false;
                if (this.client) {
                    return;
                }
                this.client = await this.socket.getClient();
                this.client.on('kubeWatch', a => {
                    eventBus.emit("resourceUpdate", a);
                });
                console.log('=> All done');
                this.toggling = false;
                this._tunnelToggled = false;
                this._socketClosed = false;
                this.ready = true;
            }
        } else {
            setTimeout(() => {
                this.checkToggleReady();
            }, 500);
        }
    }
}

export const resourceContext = new ResourceContext();