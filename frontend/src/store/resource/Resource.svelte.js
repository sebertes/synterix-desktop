import {goto} from "$app/navigation";
import {cluster} from "store/Cluster.svelte.js";
import {ResourceTemplate} from "store/resource/ResourceTemplate.svelte.js";
import {Utils} from "lib";
import yamlLib from "js-yaml";
import {ConfigProvider} from "store/Config.svelte.js";
import {popupProvider, termManager, toastProvider} from "store/Common.svelte.js";
import {KubeService} from "store/KubeService.svelte.js";
import ResourceReversions from "components/resource/ResourceReversions.svelte";
import SetProxy from "components/SetProxy.svelte";
import {KubeUtils} from "store/KubeUtils.svelte.js";

export class Resource {
    constructor(raw, resourceKinds) {
        this.raw = raw;
        this.resources = resourceKinds;
        this.handleKind = null;
    }

    get name() {
        return this.raw.metadata.name;
    }

    get namespace() {
        return this.raw.metadata.namespace;
    }

    get labels() {
        return this.raw.metadata.labels;
    }

    get annotations() {
        return this.raw.metadata.annotations;
    }

    get age() {
        return KubeUtils.formatAge(this.raw.metadata.creationTimestamp);
    }

    get kind() {
        return this.raw.kind;
    }

    getLinks(name) {
        return {
            detail: `/dashboard/${cluster.path}/resource/${this.handleKind}/${name}/detail`,
            config: `/dashboard/${cluster.path}/resource/${this.handleKind}/${name}/config`,
            yaml: `/dashboard/${cluster.path}/resource/${this.handleKind}/${name}/yaml`,
            yamle: `/dashboard/${cluster.path}/resource/${this.handleKind}/${name}/yamle`,
            edit: `/dashboard/${cluster.path}/resource/${this.handleKind}/${name}/edit`,
            clone: `/dashboard/${cluster.path}/resource/${this.handleKind}/${name}/clone`,
            cloneYaml: `/dashboard/${cluster.path}/resource/${this.handleKind}/${name}/clonee`,
            create: `/dashboard/${cluster.path}/resource/${this.handleKind}/create`,
            list: `/dashboard/${cluster.path}/resource/${this.handleKind}`
        }
    }

    download(name) {
        let row = this.getResource(name);
        if (row) {
            Utils.downloadAsYAML(yamlLib.dump(row), `${name}.yaml`);
        }
    }

    async delete(name) {
        let target = this.resources[this.handleKind].getRawByName(name);
        if (target) {
            let {code, msg} = await KubeService.delete.post({
                kind: this.handleKind,
                name: name,
                namespace: target.metadata.namespace,
            });
            if (code !== 0) {
                toastProvider.error(msg);
            }
            this.gotoList();
        } else {
            toastProvider.error("resource not find");
        }
    }

    async create({namespace, content}) {
        return await KubeService.create.post({namespace, content});
    }

    async update({namespace, content}) {
        return await KubeService.update.post({namespace, content});
    }

    async scaling({name, namespace, up = true, step = 1}) {
        return KubeService.scaling.post({
            namespace: namespace,
            name: name,
            kind: this.handleKind,
            up, step
        });
    }

    executeShell(name) {
        let target = this.resources[this.handleKind].getRawByName(name);
        if (target) {
            if (this.handleKind === 'Pod') {
                termManager.openTerm({
                    type: 'shell',
                    podName: target.metadata.name,
                    namespace: target.metadata.namespace,
                    containers: target.status.containerStatuses.map(c => ({
                        name: c.name
                    }))
                })
            } else {
                let targets = this.resources.Pod.getRawByLabels(target.spec.selector.matchLabels || {});
                targets.length > 0 && termManager.openTerm({
                    type: 'shell',
                    podName: targets[0].metadata.name,
                    namespace: targets[0].metadata.namespace,
                    containers: targets[0].status.containerStatuses.map(c => ({
                        name: c.name
                    }))
                })
            }
        }
    }

    viewLog(name) {
        let target = this.resources[this.handleKind].getRawByName(name);
        if (target) {
            if (this.handleKind === 'Pod') {
                termManager.openTerm({
                    podName: target.metadata.name,
                    type: 'log',
                    namespace: target.metadata.namespace,
                    containers: target.spec.containers.map(a => ({name: a.name}))
                })
            } else {
                let targets = this.resources.Pod.getRawByLabels(target.spec.selector.matchLabels || {});
                targets.length > 0 && termManager.openTerm({
                    type: 'log',
                    podName: targets[0].metadata.name,
                    namespace: targets[0].metadata.namespace,
                    containers: targets[0].status.containerStatuses.map(c => ({
                        name: c.name
                    }))
                })
            }
        }
    }

    async redeploy(name) {
        let target = this.getResource(name);
        if (target) {
            let {code, msg} = await KubeService.resourceRedeploy.post({
                name,
                kind: this.handleKind,
                namespace: target.metadata.namespace
            });
            if (code !== 0) {
                toastProvider.error(msg);
            }
        }
        return {code: 1, msg: "redeploy error"};
    }

    rollback(name) {
        let target = this.getResource(name);
        if (target) {
            popupProvider.open("Select Version", ResourceReversions, {
                selector: target.spec.selector.matchLabels,
                annotations: target.metadata.annotations,
                onRollback: async (revision) => {
                    let {code, msg} = await KubeService.rollback.post({
                        name,
                        kind: this.handleKind,
                        namespace: target.metadata.namespace,
                        revision
                    });
                    if (code !== 0) {
                        toastProvider.error(msg);
                    }
                }
            }, '90%', '90%');
        }
    }

    async pauseOrchestration(name) {
        let target = this.getResource(name);
        if (target) {
            let {code, msg} = await KubeService.pause.post({
                name,
                kind: this.handleKind,
                namespace: target.metadata.namespace
            });
            if (code !== 0) {
                toastProvider.error(msg);
            }
        }
        return {code: 1, msg: "redeploy error"};
    }

    async resumeOrchestration(name) {
        let target = this.getResource(name);
        if (target) {
            let {code, msg} = await KubeService.resume.post({
                name,
                kind: this.handleKind,
                namespace: target.metadata.namespace
            });
            if (code !== 0) {
                toastProvider.error(msg);
            }
        }
        return {code: 1, msg: "redeploy error"};
    }

    gotoLink(name, type) {
        let links = this.getLinks(name);
        if (links[type]) {
            goto(links[type]);
        }
    }

    getResource(name) {
        return this.resources[this.handleKind].getRawByName(name);
    }

    getResources(names) {
        return names.map(a => {
            return this.resources[this.handleKind].getRawByName(a);
        });
    }

    gotoList() {
        let links = this.getLinks(null);
        goto(links.list);
    }

    gotoCreate() {
        let links = this.getLinks(null);
        goto(links.create);
    }

    setProxy(name) {
        popupProvider.open("Set lcoal proxy", SetProxy, {
            resource: this.resources[this.handleKind].getRawByName(name),
        }, '600px');
    }


    getDependence() {
        return [];
    }

    getStatus() {
        return this.raw.status;
    }

    getMatchLabels() {
        return this.raw.spec?.selector?.matchLabels;
    }

    isMatchLabels(labels) {
        return Object.keys(labels || {}).every(key => {
            return this.raw.metadata?.labels?.[key] === labels[key];
        });
    }

    getDetail() {
        return {
            id: this.name,
            kind: this.kind,
            name: this.name,
            namespace: this.namespace,
            age: this.age,
            status: this.getStatus(),
        }
    }

    getTableRow() {
        return this.getDetail();
    }

    getTableHeader() {
        return [];
    }

    getActions() {
        return [
            'Detail',
            'Config',
            'Yaml',
            'EditConfig',
            'EditYaml',
            'Clone',
            'Download',
            'Delete'
        ];
    }

    getTableButtons() {
        return ConfigProvider.getTableButtons(this, this.getActions());
    }

    getTableMenus() {
        return ConfigProvider.getTableMenus(this, this.getActions());
    }

    onShowTableMenu(menus, name) {
        console.log('onShowTableMenu')
    }

    getCreatable() {
        return {
            name: "Create",
            action: () => {
                goto(`/dashboard/${cluster.path}/resource/${this.handleKind}/create`);
            }
        };
    }

    getLabels(resource) {
        return Reflect.ownKeys(resource.metadata.labels || {}).map(a => {
            return {key: a, value: resource.metadata.labels[a]};
        })
    }

    getAnnotations(resource) {
        return Reflect.ownKeys(resource.metadata.annotations || {}).map(a => {
            return {key: a, value: resource.metadata.annotations[a]};
        })
    }

    getIntro(resource) {
        return [];
    }

    getDetailTabs(resource) {
        return [];
    }

    getActionPages(deployment) {
        return ConfigProvider.getActionPages(this.getActions());
    }

    getDetailDropManus(deployment) {
        return ConfigProvider.getDetailDropMenus(this, deployment, this.getActions());
    }

    onShowDropMenu(menus, deployment) {
        console.log('onShowDropMenu')
    }

    getDetailComponents(resourceKind) {
        return [];
    }

    isMultiFormDefinition() {
        return false;
    }

    getMultiFormDefinitions() {
        return {
            title: "",
            types: [
                {name: "", type: "", icon: "", description: ""}
            ]
        };
    }

    getFormDefinition(type, scene) {
        return [];
    }

    async getTemplate(type) {
        return await ResourceTemplate.get(this.handleKind, type);
    }

    cleanResource(k8sResource, options = {}) {
        options = Object.assign({
            preserveRancherFields: true,
            preserveRolloutFields: true,
        }, options);
        if (!k8sResource || typeof k8sResource !== 'object') {
            return k8sResource;
        }
        const cleanMetadata = (metadata) => {
            if (!metadata) return metadata;
            const cleanMeta = {
                name: metadata.name,
                namespace: metadata.namespace,
                labels: metadata.labels,
                annotations: {}
            };
            if (metadata.annotations) {
                for (const [key, value] of Object.entries(metadata.annotations)) {
                    const shouldPreserve =
                        (options.preserveRancherFields && key.startsWith('field.cattle.io/')) ||
                        (options.preserveRolloutFields && key === 'kubectl.kubernetes.io/restartedAt') ||
                        !key.startsWith('kubectl.kubernetes.io/') && !key.startsWith('field.cattle.io/');
                    if (!shouldPreserve) {
                        cleanMeta.annotations[key] = value;
                    }
                }
                if (Object.keys(cleanMeta.annotations).length === 0) {
                    delete cleanMeta.annotations;
                }
            }
            const fieldsToRemove = [
                'creationTimestamp',
                'generation',
                'resourceVersion',
                'selfLink',
                'uid',
                'managedFields',
                'finalizers'
            ];
            fieldsToRemove.forEach(field => {
                if (cleanMeta[field]) {
                    delete cleanMeta[field];
                }
            });
            Object.keys(cleanMeta).forEach(
                key => cleanMeta[key] === undefined && delete cleanMeta[key]
            );
            return cleanMeta;
        };
        const deepClean = (obj) => {
            if (!obj || typeof obj !== 'object') return obj;
            const cleaned = Array.isArray(obj) ? [...obj] : {...obj};
            if (cleaned.metadata) {
                cleaned.metadata = cleanMetadata(cleaned.metadata);
            }
            if (cleaned.status) {
                delete cleaned.status;
            }
            for (const key in cleaned) {
                if (typeof cleaned[key] === 'object') {
                    cleaned[key] = deepClean(cleaned[key]);
                }
            }
            return cleaned;
        };
        return deepClean(k8sResource);
    }
}
