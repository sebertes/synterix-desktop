import '@xterm/xterm/css/xterm.css';
import {Utils} from "lib/index.js";

class Term {
    constructor({element, socket, params, onConnected, onDisconnected, onReconnected, theme}) {
        this._element = element;
        this._socket = socket;
        this._params = params;
        this._term = null;
        this._client = null;
        this._fitAddon = null;
        this._sessionId = null;
        this._onConnected = onConnected;
        this._onReconnected = onReconnected;
        this._onDisconnected = onDisconnected;
        this._theme = theme;
    }

    getColor(colorName) {
        const rootStyles = getComputedStyle(document.body);
        return rootStyles.getPropertyValue(`--${colorName}`).trim();
    }

    focus() {
        this._term && this._term.focus();
    }

    blur() {
        this._term && this._term.blur();
    }

    clear() {
        this._term && this._term.reset();
    }

    reset() {
        this._term && this._term.reset();
    }

    resize() {
        this._fitAddon && this._fitAddon.fit();
    }

    scrollToTop() {
        this._term && this._term.scrollToTop();
    }

    scrollToBottom() {
        this._term && this._term.scrollToBottom();
    }

    getTheme() {
        return {
            background: this.getColor('surface-container-lowest') || '#1e1e1e',
            foreground: this.getColor('on-surface') || '#ffffff',
            cursor: this.getColor('on-surface') || '#ffffff',
        };
    }

    toggleTheme(theme) {
        if (this._term && this._theme !== theme) {
            this._theme = theme;
            setTimeout(() => {
                this._term.options.theme = this.getTheme();
            });
        }
    }
}

export class LogTerm extends Term {
    constructor(params) {
        super(params);
    }

    async initialize() {
        const {Terminal} = await import('@xterm/xterm');
        const {FitAddon} = await import('@xterm/addon-fit');
        const {CanvasAddon} = await import('@xterm/addon-canvas');

        const term = this._term = new Terminal({
            fontSize: 14,
            fontFamily: 'monospace',
            theme: this.getTheme(),
            disableStdin: true,
            wraparound: true
        });
        const fitAddon = this._fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(new CanvasAddon());
        term.open(this._element);
        term.blur();
        fitAddon.fit();

        this._resizeListener = () => fitAddon.fit();
        window.addEventListener('resize', this._resizeListener);
        await this._setupClient();
    }

    async reload(params) {
        if (Utils.deepEqual(params, this._params)) {
            return;
        }
        this._params = params;
        if (this._client) {
            await this._client.stopLog(this._sessionId);
            this._client.dispose();
        }
        this.clear();
        await this._setupClient();
    }

    async _setupClient() {
        this._client = await this._socket.getClient();
        this._sessionId = await this._client.startLog(this._params);
        this._client.on('subscribe', ({topic, value, data}) => {
            if (value === this._sessionId) {
                if (topic === "watchLog") {
                    this._term.write(data.payload.replace(/\n/g, '\r\n') + "\r\n");
                } else if (topic === "watchLogEnd") {
                    this._term.write('\r\n\x1b[90mRemote disconnect\x1b[0m\r\n');
                    this._onDisconnected && this._onDisconnected();
                }
            }
        });
        this._client.on('close', () => {
            console.log('=> Shell end');
            this._term.write('\r\n\x1b[90mRemote disconnect\x1b[0m\r\n');
            this._onDisconnected && this._onDisconnected();
        });
        this._client.on('connected', async () => {
            console.log('=> Shell reconnect');
            this._client.dispose();
            await this._setupClient();
            this._onReconnected && this._onReconnected();
        });
        this._onConnected && this._onConnected();
    }

    dispose() {
        this._client && this._client.stopLog(this._sessionId);
        this._client && this._client.dispose();
        this._term && this._term.dispose();
        this._resizeListener && window.removeEventListener('resize', this._resizeListener);
        this._client = null;
        this._term = null;
        this._resizeListener = null;
        console.log('=> Log dispose done');
    }
}

export class ShellTerm extends Term {
    constructor(params) {
        super(params);
        this._init = false;
    }

    async initialize() {
        const {Terminal} = await import('@xterm/xterm');
        const {FitAddon} = await import('@xterm/addon-fit');
        const {CanvasAddon} = await import('@xterm/addon-canvas');
        const term = this._term = new Terminal({
            fontSize: 14,
            fontFamily: 'monospace',
            theme: this.getTheme(),
            disableStdin: false,
        });
        const fitAddon = this._fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(new CanvasAddon());
        term.open(this._element);
        term.focus();
        fitAddon.fit();

        this._resizeListener = () => fitAddon.fit();
        window.addEventListener('resize', this._resizeListener);
        await this._setupClient();
    }

    dispose() {
        this._client.stopShell(this._sessionId);
        this._client && this._client.dispose();
        this._term && this._term.dispose();
        this._resizeListener && window.removeEventListener('resize', this._resizeListener);
        this._client = null;
        this._term = null;
        this._resizeListener = null;
        console.log('=> Shell dispose done');
    }

    clear() {
        super.clear();
        if (this._client && this._sessionId) {
            this._init = false;
            this._client.execShell(this._sessionId, "\r");
        }
    }

    async reload(params) {
        if (Utils.deepEqual(params, this._params)) {
            return;
        }
        this._params = params;
        if (this._client) {
            await this._client.stopShell(this._sessionId);
            this._client.dispose();
        }
        if (this._eventHandler) {
            this._eventHandler.dispose();
        }
        this.clear();
        await this._setupClient();
    }

    _containsPS1(message) {
        const ps1Pattern = /\x1b\[32m.*\$ \x1b\[0m/;
        return ps1Pattern.test(message);
    }

    _extractPS1(str) {
        return str
            .replace(/\x1B(?=(\[(\d+;)*\d+m))/g, '\x1B')
            .replace(/\x1B(?!\[[\d;]*m)[^a-z]*[a-z]/gi, '')
            .replace(/[\r\n]/g, '')
            .trim();
    }

    async _setupClient() {
        this._client = await this._socket.getClient();
        this._sessionId = await this._client.startShell(this._params);
        this._eventHandler = this._term.onData((data) => {
            if (this._sessionId) {
                this._client.execShell(this._sessionId, data);
            }
        });
        this._client.on('subscribe', ({topic, value, data}) => {
            if (value === this._sessionId) {
                if (topic === 'watchShellReady') {
                    console.log('=> Shell ready to input')
                    this._client.execShell(this._sessionId, "\r").catch(e => {
                        console.log('=> Shell error:', e);
                        this._sessionId = null;
                    });
                } else if (topic === "watchShell") {
                    if (!this._init) {
                        if ((data.payload.startsWith('\r') || this._containsPS1(data.payload))) {
                            this._init = true;
                            this._term.write(this._extractPS1(data.payload));
                            console.log('=> Shell initialize done')
                        }
                    } else {
                        this._term.write(data.payload);
                    }
                } else if (topic === "watchShellEnd") {
                    console.log('=> Shell end');
                    this._term.write('\r\n\x1b[90mRemote disconnect\x1b[0m\r\n');
                    this._onDisconnected && this._onDisconnected();
                }
            }
        });
        this._client.on('close', () => {
            console.log('=> Shell end');
            this._term.write('\r\n\x1b[90mRemote disconnect\x1b[0m\r\n');
            this._onDisconnected && this._onDisconnected();
            this._term.blur();
            this._term.stdin = false;
        });
        this._client.on('connected', async () => {
            console.log('=> Shell reconnect');
            this._client.dispose();
            this._eventHandler.dispose();
            this.reset();
            this._init = false;
            await this._setupClient();
            this._term.focus();
            this._onReconnected && this._onReconnected();
        });
        this._onConnected && this._onConnected();
    }
}