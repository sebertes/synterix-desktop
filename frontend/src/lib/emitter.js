export class EventEmitter {
    constructor() {
        this._events = new Map();
    }

    on(eventName, listener) {
        if (!this._events.has(eventName)) {
            this._events.set(eventName, []);
        }
        if (!this._events.get(eventName).includes(listener)) {
            this._events.get(eventName).push(listener);
        }
        return this;
    }

    off(eventName, listener) {
        if (!this._events.has(eventName)) {
            return this;
        }
        if (!listener) {
            this._events.delete(eventName);
            return this;
        }
        if (this._events.get(eventName).includes(listener)) {
            this._events.get(eventName).splice(this._events.get(eventName).indexOf(listener), 1);
        }
        if (this._events.get(eventName).length === 0) {
            this._events.delete(eventName);
        }
        return this;
    }

    once(eventName, listener) {
        const onceWrapper = (...args) => {
            this.off(eventName, onceWrapper);
            listener(...args);
        };
        onceWrapper._origin = listener;
        this.on(eventName, onceWrapper);
        return this;
    }

    emit(eventName, ...args) {
        (this._events.get(eventName) || []).forEach(a => a(...args));
    }

    removeAllListeners(eventName) {
        if (eventName) {
            this._events.delete(eventName);
        } else {
            this._events = new Map();
        }
        return this;
    }
}