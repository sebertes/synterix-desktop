import {Resource} from "store/resource/Resource.svelte.js";

export class NodeMetrics extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }
}