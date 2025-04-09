<script>
    import Input from "components/form/Input.svelte";
    import Form from "components/form/Form.svelte";
    import {clusters, createEdge, optionsProvider, SynterixUtils, updateEdge} from "store/Synterix.svelte.js";
    import {toastProvider} from "store/Common.svelte.js";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import CheckIcon from "components/icons/CheckIcon.svelte";
    import {page} from "$app/state";

    let data = $state({});
    let form = null;
    let error = $state(false);
    let errorMsg = $state("");

    async function test() {
        let {result, message} = await form.validate();
        error = !result;
        errorMsg = message;
        if (error) {
            return;
        }
        let r = await form.getValue();
        let {code, msg} = await updateEdge.post({
            id: params.id,
            ...r
        });
        if (code === 0) {
            await optionsProvider.redirect("/dashboard")
        } else {
            toastProvider.error(msg);
        }
    }

    let params = $derived.by(() => {
        let params = {};
        page.url.search.substring(1).split("&").forEach(a => {
            let [key, value] = a.split('=');
            params[key] = value;
        });
        return params;
    });
    $effect(() => {
        if (params.id) {
            SynterixUtils.keep(clusters).done(() => {
                let t = (clusters.data || []).find(a => a.id === params.id / 1);
                if (t) {
                    data = t;
                } else {
                    optionsProvider.redirect("/dashboard");
                }
            });
        } else {
            optionsProvider.redirect("/dashboard")
        }
    })
</script>

<div class="top">
    <Form bind:this={form}>
        <div class="title">
            <a href="/dashboard">Home:</a>
            Create Edge
        </div>
        <div class="line"></div>
        <div class="sub-title">Edge Cluster Info</div>
        <div class="row">
            <Input name="name" label="name" placeholder="input username" bind:value={data.name}/>
            <Input name="description" label="description" placeholder="input username" bind:value={data.description}/>
        </div>
        {#if error}
            <div class="banner error">{errorMsg}</div>
        {/if}
    </Form>
    <div class="buttons">
        <div class="btn-group">
            <a class="btn" href="/dashboard">
                <CrossIcon/>
                Cancel
            </a>
            <button class="btn" onclick={()=>test()}>
                <CheckIcon/>
                Create
            </button>
        </div>
    </div>
</div>

<style lang="scss">
  .top {
    padding: 30px 80px 30px 80px;
  }

  .title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .sub-title {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .line {
    height: 1px;
    background: $outlineVariant;
    margin: 20px 0 20px 0;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .buttons {
    text-align: right;
  }
</style>