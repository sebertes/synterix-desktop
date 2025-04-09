<script>
    import Input from "components/form/Input.svelte";
    import Form from "components/form/Form.svelte";
    import {createEdge, createUser, optionsProvider} from "store/Synterix.svelte.js";
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
        let {username, password, rePassword} = await form.getValue();
        if (password !== rePassword) {
            error = true;
            errorMsg = 'The passwords entered twice are different';
        }
        let {code, msg} = await createUser.post({
            username, password, rePassword
        });
        if (code === 0) {
            await optionsProvider.redirect("/dashboard/users")
        } else {
            toastProvider.error(msg);
        }
    }
</script>

<div class="top">
    <Form bind:this={form}>
        <div class="section">
            <div class="title">
                <a href="/dashboard">Home:</a>
                Create Edge
            </div>
            <div class="line"></div>
            <div class="sub-title">Credentials</div>
            <div class="block colum-3">
                <Input name="username" label="Username" placeholder="input username"/>
                <Input name="password" type="password" label="Password" placeholder="input password"/>
                <Input name="rePassword" type="password" label="Confirm Password" placeholder="confirm password"/>
            </div>
            {#if error}
                <div class="banner error">{errorMsg}</div>
            {/if}
        </div>
    </Form>
    <div class="buttons">
        <div class="btn-group">
            <a class="btn" href="/dashboard/users">
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

  .buttons {
    text-align: right;
  }
</style>