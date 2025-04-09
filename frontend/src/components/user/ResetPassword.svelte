<script>

    import Input from "components/form/Input.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import CheckIcon from "components/icons/CheckIcon.svelte";
    import {popupProvider, toastProvider} from "store/Common.svelte.js";
    import Form from "components/form/Form.svelte";
    import {updateUserPassword} from "store/Synterix.svelte.js";

    let {popupId, id} = $props();

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
        let {password, rePassword, originPassword} = await form.getValue();
        if (password !== rePassword) {
            error = true;
            errorMsg = 'The passwords entered twice are different';
        }
        let {code, msg} = await updateUserPassword.post({
            password, rePassword, userId: id, originPassword
        });
        if (code === 0) {
            popupProvider.close(popupId);
        } else {
            toastProvider.error(msg);
        }
    }
</script>

<Form bind:this={form}>
    <div class="section">
        <div class="block colum-1">
            <div class="field">
                <Input label="Origin Password" name="originPassword" type="password"/>
            </div>
            <div class="field">
                <Input label="Password" name="password" type="password"/>
            </div>
            <div class="field">
                <Input label="Confirm Password" name="rePassword" type="password"/>
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
                <button class="btn btn-primary" onclick={()=>test()}>
                    <CheckIcon/>
                    Reset
                </button>
            </div>
        </div>
    </div>
</Form>
<style lang="scss">
  .section {
    margin-bottom: 0;
  }

  .btns {
    text-align: right;
    padding: 10px 0 10px 0;
  }
</style>