<script>
    import {toastProvider} from "store/Common.svelte.js";
    import {login as loginApi, optionsProvider, admin} from "store/Synterix.svelte.js";
    import Welcome from "components/images/Welcome.svelte";
    import Form from "components/form/Form.svelte";
    import Input from "components/form/Input.svelte";
    import {onMount} from "svelte";

    let form = null;
    let error = $state(false);
    let errorMsg = $state("");

    onMount(() => {
        if (admin.username) {
            window.location.reload();
        }
    })

    async function login() {
        let {result, message} = await form.validate();
        error = !result;
        errorMsg = message;
        if (error) {
            return;
        }
        let {password, username} = await form.getValue();
        let {code, data, msg} = await loginApi.post({username, password});
        if (code > 0) {
            toastProvider.error(msg);
        }
        if (code === 0) {
            optionsProvider.setValue("token", data.token);
            admin.username = data.user.username;
            admin.userId = data.user.id;
            await optionsProvider.redirect("/dashboard");
        }
    }
</script>

<div class="left">
    <div class="content">
        <div class="tips">Howdy!</div>
        <div class="title">Welcome to Synterix</div>
        <Form bind:this={form}>
            <div class="section">
                <div class="block colum-1">
                    <div class="field">
                        <Input label="Username" name="username" type="text" placeholder="input username" value="admin"/>
                    </div>
                    <div class="field">
                        <Input label="Password" name="password" type="password" placeholder="input password"
                               value="admin"/>
                    </div>
                </div>
                {#if error}
                    <div class="banner error">{errorMsg}</div>
                {/if}
            </div>
        </Form>
        <div class="btns">
            <button class="btn" onclick={()=>login()}>Login Synterix</button>
        </div>
    </div>
</div>
<div class="right">
    <div class="welcome-pic">
        <Welcome/>
    </div>
</div>
<style lang="scss">
  .left {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .content {
      width: 400px;

      .tips {
        line-height: 30px;
        text-align: center;
        font-size: 16px;
      }

      .title {
        line-height: 40px;
        text-align: center;
        font-size: 25px;
        margin-bottom: 50px;
      }

      .ipt {
        margin-top: 20px;
        margin-bottom: 20px;

        background: $surface;
        border: 1px solid $outlineVariant;
        border-radius: 4px;
        color: $onSurface;
        transition: all 0.3s ease;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
        vertical-align: middle;
        position: relative;

        .tip {
          color: $outlineVariant;
          font-size: 12px;
          pointer-events: none;
          padding: 10px 10px 0 10px;
        }

        input {
          all: unset;
          line-height: 30px;
          font-size: 13px;
          width: 100%;
          box-sizing: border-box;
          padding: 0 10px 5px 10px;
        }

        .show {
          all: unset;
          position: absolute;
          top: 20px;
          right: 0;
          bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-left: 1px solid $onPrimary;
          color: $primary;
          cursor: pointer;
          width: 80px;
          font-size: 14px;
        }

        &.pwd {
          input {
            width: calc(100% - 70px);
          }
        }

        &:hover {
          background: $surfaceContainerLowest;
        }

        &:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-hover);
        }
      }

      .btns {
        text-align: center;
      }
    }
  }

  .right {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 50%;
    background: $primaryContainer;
    display: flex;
    align-items: center;
    justify-content: center;

    .welcome-pic {
      width: 65%;
    }
  }
</style>