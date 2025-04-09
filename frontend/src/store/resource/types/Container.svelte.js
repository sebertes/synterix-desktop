import {Resource} from "store/resource/Resource.svelte.js";
import {KubeUtils} from "store/KubeUtils.svelte.js";

const CONTAINER_STATUS = {
    Active: {
        status: "Active",
        class: "status-active",
        description: (container) => `Container '${container.name}' is running and ready`
    },
    Succeeded: {
        status: "Succeeded",
        class: "status-succeeded",
        description: (container) => `Container '${container.name}' exited successfully (code: 0)`
    },
    Error: {
        status: "Error",
        class: "status-error",
        description: (container) => {
            const {reason, exitCode} = container.state.terminated || container.state.waiting || {};
            const restarts = container.restartCount || 0;
            const message = reason === "OOMKilled"
                ? "Out of memory killed"
                : reason === "CrashLoopBackOff"
                    ? `Crashed repeatedly (restarts: ${restarts})`
                    : `Exited with error code ${exitCode}`;
            return `Container '${container.name}' failed: ${message}`;
        }
    },
    Transitioning: {
        status: "Transitioning",
        class: "status-transitioning",
        description: (container) => {
            const {reason} = container.state.waiting || {};
            return reason === "ContainerCreating"
                ? `Container '${container.name}' is starting`
                : `Container '${container.name}' is terminating`;
        }
    },
    Unknown: {
        status: "Unknown",
        class: "status-unknown",
        description: (container) => `Container '${container.name}' state is unknown`
    }
};

export class Container extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getStatus() {
        let container = this.raw;
        const {state = {}, restartCount = 0} = container || {};
        const {waiting, running, terminated} = state;
        if (terminated) {
            return terminated.exitCode === 0 ? {
                ...CONTAINER_STATUS.Succeeded,
                message: CONTAINER_STATUS.Succeeded.description(container)
            } : {
                ...CONTAINER_STATUS.Error,
                message: CONTAINER_STATUS.Error.description(container)
            };
        }
        if (waiting) {
            const errorReasons = ["CrashLoopBackOff", "ImagePullBackOff", "ErrImagePull", "OOMKilled"];
            return errorReasons.includes(waiting.reason) ? {
                ...CONTAINER_STATUS.Error,
                message: CONTAINER_STATUS.Error.description(container)
            } : {
                ...CONTAINER_STATUS.Transitioning,
                message: CONTAINER_STATUS.Transitioning.description(container)
            };
        }
        if (running) {
            return container.ready ? {
                ...CONTAINER_STATUS.Active,
                message: CONTAINER_STATUS.Active.description(container)
            } : {
                ...CONTAINER_STATUS.Transitioning,
                message: CONTAINER_STATUS.Transitioning.description(container)
            };
        }
        return {
            ...CONTAINER_STATUS.Unknown,
            message: CONTAINER_STATUS.Unknown.description(container)
        };
    }

    getTableRow() {
        let item= {
            ...this.raw,
            id: this.raw.name,
            status: this.getStatus(),
            age: KubeUtils.formatAge(this.raw.state.running?.startedAt ||
                this.raw.state.waiting?.startedAt ||
                this.raw.state.terminated?.startedAt ||
                this.raw.state.terminated?.finishedAt || this.raw.state.termin)
        };
        if (item.status.status !== 'Active' && item.status.message) {
            item.rowOption = {className: 'row-desc'};
            item.status.showDescription = true;
        }
        return item;
    }
}