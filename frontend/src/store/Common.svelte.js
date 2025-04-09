import {Utils} from "lib/index.js";
import {EventEmitter} from "lib/emitter.js";

class TermManager {
    list = $state([]);
    active = $state(null);
    open = $state(false);

    openTerm({type, namespace, podName, containers}) {
        let id = `${type}-${podName}`;
        let target = this.list.find(t => t.id === id);
        if (target) {
            this.active = target.id;
            return;
        }
        this.list.push({id, type, namespace, podName, containers});
        this.active = id;
        this.open = true;
    }

    closeTerm(id) {
        let index = this.list.findIndex(t => t.id === id);
        if (index > -1) {
            this.list.splice(index, 1);
        }
        if (this.list.length > 0) {
            this.active = this.list[this.list.length - 1].id;
        } else {
            this.active = null;
            this.open = false;
        }
    }

    toggleTerm(id) {
        this.active = id;
    }
}

class EventBus extends EventEmitter {
    constructor() {
        super();
    }
}

class ToastProvider {
    list = $state([]);

    open(type, message, {top, delay = 5000} = {}) {
        let id = Utils.getRandomId();
        this.list.push({id, type, message, top});
        setTimeout(() => this.close(id), delay);
        return id;
    }

    success(message, delay = 5000) {
        this.open("success", message, {delay});
    }

    error(message, delay = 5000) {
        this.open("error", message, {delay});
    }

    update(id, {type, message}) {
        let t = this.list.find(a => a.id === id);
        if (t) {
            Object.assign(t, {type, message});
        }
    }

    loading(message) {
        let id = this.open("loading", message);
        return {
            id,
            success(message) {
                this.update(id, {type: "success", message});
                setTimeout(() => this.close(id), 5000);
            },
            error() {
                this.update(id, {type: "error", message});
                setTimeout(() => this.close(id), 5000);
            }
        };
    }

    close(id) {
        let t = this.list.findIndex(a => a.id === id);
        if (t !== -1) {
            this.list.splice(t, 1);
        }
    }
}

class PopupProvider {
    list = $state([]);

    open(title, component, options, width, height) {
        let id = Utils.getRandomId();
        this.list.push({id, title, component, options, width, height});
        return id;
    }

    close(id) {
        let t = this.list.findIndex(a => a.id === id);
        if (t !== -1) {
            this.list.splice(t, 1);
        }
    }
}

export const popupProvider = new PopupProvider();
export const toastProvider = new ToastProvider();
export const eventBus = new EventBus();
export const termManager = new TermManager();