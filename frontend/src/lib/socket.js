import {EventEmitter} from "./emitter.js";
import {browser} from '$app/environment';
import {Utils} from "lib/index.js";
import {eventBus} from "store/Common.svelte.js";

export const REQUEST = {
    subscribe: "subscribe",
    unsubscribe: "unsubscribe",
    startLog: "startLog",
    stopLog: "stopLog",
    startShell: "startShell",
    activeShell: "activeShell",
    stopShell: "stopShell",
    execShell: "execShell"
}
const PUSH = {
    response: "response",
    responseBack: "responseBack",
    subscribe: "subscribe",
    kubeWatch: "kubeWatch",
    gtmApisWatch: "gtmApisWatch",
    gtmEdgesWatch: "gtmEdgesWatch",
    gtmEdgesState: "gtmEdgesState"
};
const CALLBACK = new Map();
const pushHandlers = {
    [PUSH.subscribe]: (data, client) => {
        client.emit("subscribe", data);
    },
    [PUSH.kubeWatch]: (data, client) => {
        client.emit("kubeWatch", data);
    },
    [PUSH.gtmApisWatch]: (data, client) => {
        client.emit("gtmApisWatch", data);
    },
    [PUSH.gtmEdgesWatch]: (data, client) => {
        client.emit("gtmEdgesWatch", data);
    },
    [PUSH.gtmEdgesState]: (data, client) => {
        client.emit("gtmEdgesState", data);
    },
    [PUSH.response]: (data, client) => {
        let {id, code, msg} = data;
        if (code === 0) {
            if (CALLBACK.has(id)) {
                CALLBACK.get(id).resolve(data.data);
                CALLBACK.delete(id);
            }
        } else {
            if (CALLBACK.has(id)) {
                CALLBACK.get(id).reject(msg);
                CALLBACK.delete(id);
            }
        }
    },
    [PUSH.responseBack]: (data, client) => {
        let {id, code, msg} = data;
        if (code === 0) {
            if (CALLBACK.has(id)) {
                CALLBACK.get(id).resolve(JSON.parse(data.data));
                CALLBACK.delete(id);
            }
        } else {
            if (CALLBACK.has(id)) {
                CALLBACK.get(id).reject(msg);
                CALLBACK.delete(id);
            }
        }
    }
};

export class BaseSocket extends EventEmitter {
    constructor(url, options) {
        super();
        this.host = `ws://localhost:${window.localStorage.port}`;
        this.url = url;
        this.options = options;
        this._socket = null;
        this._connectPromise = null;

        this.isManualClose = false;
        this.heartbeatInterval = null;
        this.reconnectIntervalTimeout = 5000;
        this.heartbeatIntervalTimeout = 10000;

        this.clients = new Map();
    }

    _getURL() {
        return `${this.host}${this.url()}`;
    }

    _getPingMessage() {
        return {method: "ping", id: Utils.getRandomId(), params: {time: Date.now()}};
    }

    _reconnect() {
        console.log(`=> Socket Reconnecting...`, this.clients.size);
        if (this._connectPromise) {
            return;
        }
        setTimeout(() => {
            this.emit("reconnect");
            this.clients.forEach(client => {
                try {
                    client.onReconnect();
                } catch (_) {
                }
            });
            this._connect().catch(error => {
                console.error('Socket Reconnect failed:', error);
                this.emit("reconnectFailed");
                this.clients.forEach(client => {
                    try {
                        client.onReconnectError(error);
                    } catch (_) {
                    }
                });
            });
        }, this.reconnectIntervalTimeout);
    }

    _connect() {
        if (this._socket?.readyState === WebSocket.OPEN) {
            return Promise.resolve(this._socket);
        }
        if (!this._connectPromise) {
            this._connectPromise = new Promise((resolve, reject) => {
                const socket = this.options ? new WebSocket(this._getURL(), this.options) : new WebSocket(this._getURL());
                socket.onopen = () => {
                    console.log('=> Socket connected');
                    this.isManualClose = false;
                    this.heartbeatInterval = setInterval(() => {
                        if (socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify(this._getPingMessage()));
                        }
                    }, this.heartbeatIntervalTimeout);
                    this.emit("connected");
                    this.clients.forEach(client => {
                        try {
                            client.onConnected();
                        } catch (_) {
                        }
                    });
                    socket.onclose = (event) => {
                        console.log('=> Socket closed:', event.code, event.reason);
                        eventBus.emit("socketClosed");
                        this._cleanup();
                        this.emit("closed", event.code);
                        this.clients.forEach(client => {
                            try {
                                client.onClosed(event);
                            } catch (_) {
                            }
                        });
                        if (!this.isManualClose) {
                            this._reconnect();
                        }
                    };
                    socket.onerror = (error) => {
                        console.error('Socket error:', error);
                        this._cleanup();
                        this.emit("error", error);
                        this.clients.forEach(client => {
                            try {
                                client.onError(error);
                            } catch (_) {
                            }
                        });
                    };
                    socket.onmessage = (event) => {
                        this.emit("message", event);
                        this.clients.forEach(client => {
                            try {
                                if (event.data) {
                                    client.onMessage(JSON.parse(event.data));
                                }
                            } catch (_) {
                            }
                        });
                    };
                    this._connectPromise = null;
                    this._socket = socket;
                    resolve(socket);
                };
                socket.onerror = (error) => {
                    this._connectPromise = null;
                    this._socket = null;
                    this._cleanup();
                    this._reconnect();
                    reject(error);
                };
            });
        }
        return this._connectPromise;
    }

    _cleanup() {
        this._socket = null;
        clearInterval(this.heartbeatInterval);
    }

    _getClient(id) {
        return null;
    }

    async getClient() {
        await this._connect();
        let id = Utils.getRandomId();
        let t = this._getClient(id);
        t && this.clients.set(id, t);
        return t;
    }

    release(id) {
        console.log('=> Release client:', id);
        this.clients.delete(id);
    }

    sendMessage(obj) {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            this._socket.send(JSON.stringify(obj));
            return true;
        }
        return false;
    }

    async close(code = 1000, reason = 'Manual close') {
        this.isManualClose = true;
        this._connectPromise = null;
        this.clients.clear();
        if (this._socket) {
            await this._socket.close(code, reason);
        } else {
            setTimeout(() => eventBus.emit("socketClosed"));
        }
        this._cleanup();
    }
}

export class KubeSocket extends BaseSocket {
    constructor(url, options) {
        super(url, options);
    }

    _getClient(id) {
        return new KubeClient(id, this);
    }
}

export class SynterixSocket extends BaseSocket {
    constructor(url, options) {
        super(url, options);
    }

    _getPingMessage() {
        return {type: "ping", data: JSON.stringify({time: Date.now()})};
    }

    _getClient(id) {
        return new SynterixClient(id, this);
    }
}


class SocketClient extends EventEmitter {
    constructor(id, socket) {
        super();
        this.id = id;
        this.socket = socket;
    }

    onMessage(data) {
        if (!data.type && data.id !== undefined && data.code !== undefined) {
            data.type = PUSH.responseBack;
        }
        if (pushHandlers[data.type]) {
            pushHandlers[data.type](data, this);
        }
    }

    onReconnect() {
        console.log(`=> Socket client[${this.id}] reconnecting`);
        this.emit("reconnect");
    }

    onReconnectError(error) {
        console.error(`=> Socket client[${this.id}] Reconnect failed:`, error);
        this.emit("reconnectError", error);
    }

    onConnected() {
        console.log(`=> Socket client[${this.id}] connected`);
        this.emit("connected");
    }

    onClosed() {
        console.log(`=> Socket client[${this.id}] disconnected`);
        this.emit("close", null);
    }

    onError() {
        console.error(`Socket client[${this.id}] error:`, error);
        this.emit("close", error);
    }

    dispose() {
        this.socket.release(this.id);
    }

    sendMessage(obj) {
        return this.socket.sendMessage(obj);
    }
}

class KubeClient extends SocketClient {
    constructor(id, socket) {
        super(id, socket);
    }

    request(method, params) {
        const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.sendMessage({id, method, params});
        return new Promise((resolve, reject) => {
            CALLBACK.set(id, {resolve, reject});
        });
    }

    subscribe(params) {
        return this.request(REQUEST.subscribe, params);
    }

    unsubscribe(params) {
        return this.request(REQUEST.unsubscribe, params);
    }

    startLog(params) {
        return this.request(REQUEST.startLog, params);
    }

    stopLog(id) {
        return this.request(REQUEST.stopLog, {sessionId: id});
    }

    startShell(params) {
        return this.request(REQUEST.startShell, params);
    }

    stopShell(id) {
        return this.request(REQUEST.stopShell, {sessionId: id});
    }

    execShell(id, command) {
        return this.request(REQUEST.execShell, {sessionId: id, command});
    }
}

class SynterixClient extends SocketClient {
    constructor(id, socket) {
        super(id, socket);
    }

    async request(type, params = {}) {
        return new Promise((resolve, reject) => {
            let id = Utils.getRandomId();
            CALLBACK.set(id, {resolve, reject});
            this.sendMessage({id, type, data: JSON.stringify({type, ...params})});
        });
    }
}