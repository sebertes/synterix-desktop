<script>

    import Input from "components/form/Input.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import CheckIcon from "components/icons/CheckIcon.svelte";
    import {popupProvider, toastProvider} from "store/Common.svelte.js";
    import {cluster} from "store/Cluster.svelte";
    import {proxies} from "store/Synterix.svelte.js";
    import {Utils} from "lib";

    let {resource, popupId} = $props();
    let name = $state("");
    let description = $state("");
    let port = $state("");
    let error = $state(false);
    let errorMsg = $state("");

    function onSubmit(e) {
        let r = {};
        if (!name || !port) {
            error = true;
            errorMsg = "name and port can not empty";
            return;
        }

        if (resource.kind === 'Service') {
            r = {
                name,
                description,
                localPort: port,
                serviceType: "service",
                namespace: resource.metadata.namespace,
                cluster: cluster.id,
                service: resource.metadata.name,
                target: {
                    host: resource.spec.clusterIP,
                    port: resource.spec.ports[0].port,
                }
            };
        } else if (resource.kind === 'Pod') {
            r = {
                name,
                description,
                localPort: port,
                serviceType: "pod",
                namespace: resource.metadata.namespace,
                cluster: cluster.id,
                pod: resource.metadata.name,
                target: {
                    host: resource.status.podIP,
                    port: resource.spec.containers[0].ports[0].containerPort,
                }
            };
        }
        if (r) {
            r.id = Utils.getRandomId();
            if (proxies.createProxy(r)) {
                toastProvider.success("Created success");
                popupProvider.close(popupId);
            } else {
                toastProvider.error("Created failed");
            }
        } else {
            toastProvider.success("Created success");
        }
    }
</script>
<div class="section">
    <div class="block colum-3">
        <div class="field">
            <Input label="Name" bind:value={name}/>
        </div>
        <div class="field">
            <Input label="Description" bind:value={description}/>
        </div>
        <div class="field">
            <Input label="Local Port" type="number" bind:value={port}/>
        </div>
    </div>
    {#if error}
        <div class="banner error">{errorMsg}</div>
    {/if}
    <div class="btns">
        <div class="btn-group">
            <button class="btn btn-primary" onclick={()=>popupProvider.close(popupId)}>
                <CrossIcon/>
                Cancel
            </button>
            <button class="btn btn-primary" onclick={()=>onSubmit()}>
                <CheckIcon/>
                Save
            </button>
        </div>
    </div>
</div>

<style lang="scss">
  .section {
    margin-bottom: 0;
  }

  .btns {
    text-align: right;
    padding: 10px 0 10px 0;
  }
</style>