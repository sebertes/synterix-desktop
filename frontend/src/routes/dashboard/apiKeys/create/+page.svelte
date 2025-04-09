<script>
    import Input from "components/form/Input.svelte";
    import Form from "components/form/Form.svelte";
    import {createApi, createEdge, optionsProvider} from "store/Synterix.svelte.js";
    import {toastProvider} from "store/Common.svelte.js";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import CheckIcon from "components/icons/CheckIcon.svelte";

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
        let {code, msg} = await createApi.post(r);
        if (code === 0) {
            await optionsProvider.redirect("/dashboard/apiKeys")
        } else {
            toastProvider.error(msg);
        }
    }
</script>

<div class="top">
    <Form bind:this={form}>
        <div class="title">
            <a href="/dashboard">Home:</a>
            Create Edge
        </div>
        <div class="line"></div>
        <div class="sub-title">Credentials</div>
        <div class="row">
            <Input name="name" label="name" placeholder="input username"/>
            <Input name="description" label="description" placeholder="input username"/>
        </div>
        {#if error}
            <div class="banner error">{errorMsg}</div>
        {/if}
    </Form>
    <div class="buttons">
        <div class="btn-group">
            <button class="btn">
                <CrossIcon/>
                Cancel
            </button>
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