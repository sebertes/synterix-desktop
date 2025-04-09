import {Resource} from "store/resource/Resource.svelte.js";

export class Endpoints extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }
}