<script>

    import Input from "components/form/Input.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import CheckIcon from "components/icons/CheckIcon.svelte";
    import {popupProvider, toastProvider} from "store/Common.svelte.js";
    import {cluster} from "store/Cluster.svelte";
    import {proxies} from "store/Synterix.svelte.js";
    import {Utils} from "lib";
    import {goto} from "$app/navigation";

    let {resource, popupId} = $props();
    let name = $state("");
    let description = $state("");
    let port = $state("");
    let error = $state(false);
    let errorMsg = $state("");

    function onSubmit() {
        if (!name || !port) {
            error = true;
            errorMsg = "name and port can not empty";
            return;
        }
        let r = {
            name,
            description,
            localPort: port,
            serviceType: "kube",
            cluster: cluster.id,
            target: {}
        };
        r.id = Utils.getRandomId();
        if (proxies.createProxy(r)) {
            popupProvider.close(popupId);
            goto(`/dashboard/proxy/detail?id=${r.id}`);
        } else {
            toastProvider.error("Created failed");
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