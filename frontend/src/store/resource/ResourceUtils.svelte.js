import {resourceContext} from "store/resource/ResourceContext.svelte.js";
import {Kinds} from "store/resource/ResourceConst.svelte.js";
import {KubeService} from "store/KubeService.svelte.js";

let resourceReady = $state(false);
let resourceKinds = null;

class ResourceSchema {
    constructor() {
        this.schema = null;
        this.loadPromise = null;
    }

    async get() {
        if (this.schema) {
            return this.schema;
        }
        if (!this.loadPromise) {
            this.loadPromise = KubeService.schema.post().then(({code, data}) => {
                this.loadPromise = null;
                if (code === 0) {
                    this.schema = JSON.parse(data);
                    return this.schema;
                } else {
                    return null;
                }
            });
        }
        return this.loadPromise;
    }

    async getKind(kind) {
        let schema = await this.get();
        console.log(schema);
        return this.generateK8sDefaultResource(kind, {definitions: schema});
    }

    generateK8sDefaultResource(kind, fullSchema) {
        const definitionKey = this.findDefinitionKeyByKind(kind, fullSchema);
        if (!definitionKey) {
            throw new Error(`Kind '${kind}' not found in schema`);
        }
        const resourceSchema = fullSchema.definitions[definitionKey];
        if (!resourceSchema) {
            throw new Error(`Schema definition for '${definitionKey}' not found`);
        }
        return this.generateResourceFromSchema(resourceSchema, fullSchema.definitions);
    }

    findDefinitionKeyByKind(kind, fullSchema) {
        for (const [key, definition] of Object.entries(fullSchema.definitions)) {
            if (definition['x-kubernetes-group-version-kind']) {
                const gvk = definition['x-kubernetes-group-version-kind'][0];
                if (gvk.kind === kind) {
                    return key;
                }
            }
        }
        return null;
    }

    generateResourceFromSchema(schema, definitions) {
        const resource = {};
        if (schema['x-kubernetes-group-version-kind']) {
            const gvk = schema['x-kubernetes-group-version-kind'][0];
            resource.apiVersion = gvk.group ? `${gvk.group}/${gvk.version}` : gvk.version;
            resource.kind = gvk.kind;
        }
        if (schema.properties) {
            for (const [propName, propSchema] of Object.entries(schema.properties)) {
                if (propName === 'apiVersion' || propName === 'kind') continue;
                resource[propName] = this.generatePropertyValue(propSchema, definitions);
            }
        }
        return resource;
    }

    generatePropertyValue(propSchema, definitions) {
        if (propSchema.$ref) {
            const refPath = propSchema.$ref;
            if (refPath.startsWith('#/definitions/')) {
                const definitionKey = refPath.substring('#/definitions/'.length);
                const definition = definitions[definitionKey];
                if (definition) {
                    return this.generateResourceFromSchema(definition, definitions);
                }
            }
            return {};
        }
        switch (propSchema.type) {
            case 'string':
                if (propSchema.enum) return propSchema.enum[0]; // 如果有枚举值，使用第一个
                return propSchema.format === 'date-time' ? new Date().toISOString() : '';
            case 'number':
            case 'integer':
                return 0;
            case 'boolean':
                return false;
            case 'array':
                const itemsSchema = propSchema.items || {};
                return [this.generatePropertyValue(itemsSchema, definitions)];
            case 'object':
                if (propSchema.properties) {
                    const obj = {};
                    for (const [name, schema] of Object.entries(propSchema.properties)) {
                        obj[name] = this.generatePropertyValue(schema, definitions);
                    }
                    return obj;
                } else if (propSchema.additionalProperties) {
                    return {
                        key: this.generatePropertyValue(propSchema.additionalProperties, definitions)
                    };
                }
                return {};
            default:
                return null;
        }
    }
}

class ResourceKindKeeper {
    constructor(kinds) {
        this.kinds = kinds;
    }

    ready(fn) {
        let t = this.kinds.map(() => false);
        this.kinds.forEach((a, i) => {
            a.ready(() => {
                t[i] = true;
                if (t.filter(a => a === false).length === 0) {
                    fn && fn();
                }
            });
        });
    }
}

export class ResourceProvider {
    constructor(list) {
        this.list = list;
        this.kinds = list.map(a => a.kind);
        this.resources = null;
    }

    async getResources() {
        if (this.resources) {
            return this.resources;
        }
        let {ResourceKinds} = await import("store/resource/ResourceProvider.svelte.js");
        this.resources = ResourceKinds;
        return ResourceKinds;
    }

    async _getDependencies() {
        let resources = await this.getResources();
        let dependence = [];
        this.kinds.map(a => resources[a]).forEach(a => {
            a._getDependence().forEach(a => {
                if (!dependence.includes(a)) {
                    dependence.push(a);
                }
            })
        });
        return dependence;
    }

    ready(fn) {
        if (resourceContext.locked) {
            return;
        }
        this._getDependencies().then(dependence => {
            dependence.forEach(a => a.keeper.get());
            if (dependence.find(a => !a.keeper.done) === undefined) {
                fn && fn();
            }
        });
    }

    wait(fn) {
        if (resourceContext.locked) {
            return;
        }
        this._getDependencies().then(dependence => {
            dependence.forEach(a => a.keeper.get());
            if (dependence.find(a => !a.keeper.done) === undefined) {
                fn && fn(true);
            } else {
                fn && fn(false);
            }
        });
    }

    getCommonDetailList() {
        return this.list.map(({name, kind, namespace}) => {
            let t = this.resources[kind].getAllList().find(a => a.namespace === namespace && a.name === name);
            if (t) {
                return t.getDetail();
            }
            return null;
        }).filter(a => !!a);
    }
}

export const ResourcesUtils = {
    schema: new ResourceSchema(),
    withs(...kinds) {
        return new ResourceKindKeeper(kinds);
    },
    isSupport(kind) {
        return !!Kinds[kind];
    },
    getResourceProvider(list) {
        return new ResourceProvider(list);
    },
    _readyResource() {
        if (!resourceReady) {
            import("store/resource/ResourceProvider.svelte.js").then(({ResourceKinds}) => {
                resourceKinds = ResourceKinds;
                resourceReady = true;
            });
        }
    },
    async getResourceKinds() {
        let {ResourceKinds} = await import("store/resource/ResourceProvider.svelte.js");
        return ResourceKinds;
    },
    async kindsReady(kinds = [], fn) {
        this._readyResource();
        if (resourceReady) {
            new ResourceKindKeeper(kinds.map(a => resourceKinds[a])).ready(() => {
                let r = new Map();
                kinds.forEach(a => {
                    r.set(a, resourceKinds[a]);
                });
                fn && fn(r);
            })
        }
    },
    async ready(kind, fn) {
        this._readyResource();
        if (resourceReady) {
            resourceKinds[kind].ready(() => {
                fn && fn(resourceKinds[kind]);
            });
        }
    },
    async wait(kind, fn) {
        this._readyResource();
        if (resourceReady) {
            resourceKinds[kind].wait((isReady) => {
                fn && fn(isReady, resourceKinds[kind]);
            });
        }
    },
    async waitUtil(kind, fn) {
        this._readyResource();
        if (resourceReady) {
            resourceKinds[kind].waitUtil(() => {
                fn && fn(resourceKinds[kind]);
            });
        }
    },
    async getKindHandler(kind) {
        let resources = await this.getResourceKinds();
        return resources[kind]?.getHandler();
    }
}