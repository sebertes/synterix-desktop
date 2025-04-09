import {Utils} from "lib";

class DataRequest {
    constructor(url) {
        this.url = url;
    }

    async post(params = {}) {
        let response = await fetch(Utils.fixHost(this.url), {
            method: "post",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        });
        if (response.ok) {
            return await response.json();
        }
        return {code: 1, msg: "error"};
    }
}

export const KubeService = {
    kubeAuth: new DataRequest('/kube/auth'),
    schema: new DataRequest('/kube/schema'),
    resourceCount: new DataRequest('/kube/resource/count'),
    findRefers: new DataRequest('/kube/resource/refers'),
    findEvents: new DataRequest('/kube/resource/events'),
    importResource: new DataRequest('/kube/resource/import'),
    create: new DataRequest("/kube/resource/create"),
    update: new DataRequest("/kube/resource/update"),
    delete: new DataRequest("/kube/resource/delete"),
    resume: new DataRequest("/kube/resource/resume"),
    pause: new DataRequest("/kube/resource/pause"),
    scaling: new DataRequest("/kube/resource/scaling"),
    rollback: new DataRequest("/kube/resource/rollback"),
    resourceRedeploy: new DataRequest('/kube/resource/redeploy'),
}