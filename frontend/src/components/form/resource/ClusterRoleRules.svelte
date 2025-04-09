<script>
    import MultipeSelect from "components/form/MultipeSelect.svelte";
    import StringArray from "components/form/resource/StringArray.svelte";

    let {value = $bindable([]), callback, disabled} = $props();
    let portList = $state([]);

    let apiGroups = [
        {name: "*", value: "*"},
        {name: "apps", value: "apps"},
        {name: "batch", value: "batch"},
        {name: "extensions", value: "extensions"},
        {name: "networking.k8s.io", value: "networking.k8s.io"},
        {name: "policy", value: "policy"},
        {name: "rbac.authorization.k8s.io", value: "rbac.authorization.k8s.io"},
        {name: "storage.k8s.io", value: "storage.k8s.io"},
        {name: "autoscaling", value: "autoscaling"},
        {name: "certificates.k8s.io", value: "certificates.k8s.io"},
        {name: "events.k8s.io", value: "events.k8s.io"},
        {name: "admissionregistration.k8s.io", value: "admissionregistration.k8s.io"},
        {name: "scheduling.k8s.io", value: "scheduling.k8s.io"},
        {name: "coordination.k8s.io", value: "coordination.k8s.io"},
        {name: "node.k8s.io", value: "node.k8s.io"},
        {name: "flowcontrol.apiserver.k8s.io", value: "flowcontrol.apiserver.k8s.io"},
        {name: "authentication.k8s.io", value: "authentication.k8s.io"},
        {name: "apiextensions.k8s.io", value: "apiextensions.k8s.io"},
        {name: "metrics.k8s.io", value: "metrics.k8s.io"},
        {name: "rbac.authorization.k8s.io", value: "rbac.authorization.k8s.io"},
        {name: "authorization.k8s.io", value: "authorization.k8s.io"},
        {name: "discovery.k8s.io", value: "discovery.k8s.io"},
        {name: "internal.apiserver.k8s.io", value: "internal.apiserver.k8s.io"},
        {name: "apiregistration.k8s.io", value: "apiregistration.k8s.io"},
        {name: "storage.k8s.io", value: "storage.k8s.io"},
        {name: "networking.k8s.io", value: "networking.k8s.io"},
        {name: "rbac.authorization.k8s.io", value: "rbac.authorization.k8s.io"},
        {name: "apiextensions.k8s.io", value: "apiextensions.k8s.io"},
        {name: "rbac.authorization.k8s.io", value: "rbac.authorization.k8s.io"},
    ];
    let resources = [
        {name: "*", value: "*"},
        {name: "pods", value: "pods"},
        {name: "pods/attach", value: "pods/attach"},
        {name: "pods/exec", value: "pods/exec"},
        {name: "pods/portforward", value: "pods/portforward"},
        {name: "pods/proxy", value: "pods/proxy"},
        {name: "pods/log", value: "pods/log"},
        {name: "services", value: "services"},
        {name: "services/proxy", value: "services/proxy"},
        {name: "namespaces", value: "namespaces"},
        {name: "namespaces/proxy", value: "namespaces/proxy"},
        {name: "nodes", value: "nodes"},
        {name: "nodes/proxy", value: "nodes/proxy"},
        {name: "endpoints", value: "endpoints"},
        {name: "endpoints/proxy", value: "endpoints/proxy"},
        {name: "replicationcontrollers", value: "replicationcontrollers"},
        {name: "replicationcontrollers/proxy", value: "replicationcontrollers/proxy"},
        {name: "limitranges", value: "limitranges"},
        {name: "resourcequotas", value: "resourcequotas"},
        {name: "persistentvolumeclaims", value: "persistentvolumeclaims"},
        {name: "persistentvolumes", value: "persistentvolumes"},
        {name: "configmaps", value: "configmaps"},
        {name: "secrets", value: "secrets"},
        {name: "serviceaccounts", value: "serviceaccounts"},
        {name: "roles", value: "roles"},
        {name: "rolebindings", value: "rolebindings"},
        {name: "clusterrolebindings", value: "clusterrolebindings"},
        {name: "clusterroles", value: "clusterroles"},
        {name: "customresourcedefinitions", value: "customresourcedefinitions"},
        {name: "ingresses", value: "ingresses"},
        {name: "daemonsets", value: "daemonsets"},
        {name: "deployments", value: "deployments"},
        {name: "statefulsets", value: "statefulsets"},
        {name: "cronjobs", value: "cronjobs"},
        {name: "jobs", value: "jobs"},
        {name: "horizontalpodautoscalers", value: "horizontalpodautoscalers"},
        {name: "poddisruptionbudgets", value: "poddisruptionbudgets"},
        {name: "networkpolicies", value: "networkpolicies"},
        {name: "ingresses", value: "ingresses"},
        {name: "pods", value: "pods"},
    ]
    let verbs = [
        {name: "*", value: "*"},
        {name: "get", value: "get"},
        {name: "list", value: "list"},
        {name: "watch", value: "watch"},
        {name: "create", value: "create"},
        {name: "update", value: "update"},
        {name: "patch", value: "patch"},
        {name: "delete", value: "delete"},
        {name: "deletecollection", value: "deletecollection"},
    ]

    function add() {
        portList.push({
            id: Math.random(),
            apiGroups: [],
            resources: [],
            nonResourceURLs: [],
            verbs: [],
        });
    }

    function remove(port) {
        portList = portList.filter(a => a.id !== port.id);
    }

    $effect(() => {
        if (value) {
            portList = value.map(a => {
                return {
                    id: Math.random(),
                    apiGroups: a.apiGroups || [],
                    resources: a.resources || [],
                    nonResourceURLs: a.nonResourceURLs || [],
                    verbs: a.verbs || [],
                };
            });
        }
    });

    function update() {
        let t = portList.map((a) => {
            return {
                apiGroups: a.apiGroups || [],
                resources: a.resources || [],
                nonResourceURLs: a.nonResourceURLs || [],
                verbs: a.verbs || [],
            };
        });
        value = t;
        callback && callback(t);
    }

</script>
<div class="section">
    <div class="title">Rules</div>
    {#each portList as port}
        <div class="block port-grid">
            <div class="field">
                <div class="title">Api Groups</div>
                <MultipeSelect label="ApiGroups"
                               options={apiGroups}
                               bind:value={port.apiGroups}
                               onClose={()=>update()}
                               disabled={disabled}/>
            </div>
            <div class="field">
                <div class="title">Resources</div>
                <MultipeSelect options={resources}
                               label="Resources"
                               bind:value={port.resources}
                               onClose={()=>update()}
                               disabled={disabled}/>
            </div>
            <div class="field">
                <div class="title">Verbs</div>
                <MultipeSelect label="Verbs"
                               options={verbs}
                               bind:value={port.verbs}
                               onClose={()=>update()}
                               disabled={disabled}/>
            </div>
            <div class="field">
                <StringArray label="nonResourceURLs"
                             bind:value={port.nonResourceURLs}
                             callback={()=>update()}
                             disabled={disabled}/>
            </div>
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" onclick={()=>remove(port)} disabled={disabled}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add Rule</button>
    </div>
</div>

<style lang="scss">
  .port-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr 80px;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>