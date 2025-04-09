<script>
    import UserIntro from "components/UserIntro.svelte";
    import Table from "components/Table.svelte";
    import DeleteIcon from "components/icons/DeleteIcon.svelte";
    import {admin, deleteApi, getApiList} from "store/Synterix.svelte.js";
    import {popupProvider, toastProvider} from "store/Common.svelte.js";
    import ResetPassword from "components/user/ResetPassword.svelte";

    let time = $state(Date.now());
    let data = $state([]);
    let ready = $state(false);
    let header = [
        {name: "Name", key: "name", align: "left"},
        {name: "Description", key: "description", align: "left"},
        {name: "CreatedAt", key: "createdAt", align: "left"},
    ];
    let buttons = [
        {
            label: 'Delete',
            icon: DeleteIcon,
            action: async (ids) => {
                for (let id of ids) {
                    let {code, msg} = await deleteApi.post({id});
                    if (code !== 0) {
                        toastProvider.error(msg);
                        return;
                    }
                }
                time = Date.now();
            }
        }
    ];
    let menus = [
        {
            label: 'Delete',
            icon: DeleteIcon,
            type: 'active',
            action: async (id) => {
                let {code, msg} = await deleteApi.post({id});
                if (code !== 0) {
                    toastProvider.error(msg);
                    return;
                }
                time = Date.now();
                ready = false;
            }
        },
    ];
    let checkbox = true;

    function resetPassword() {
        popupProvider.open("Reset Password", ResetPassword, {id: admin.userId}, '500px');
    }

    $effect(async () => {
        if (time) {
            let r = await getApiList.post();
            if (r.code === 0) {
                data = r.data;
                ready = true;
            }
        }
    })
</script>

<UserIntro/>
<div class="body">
    <div class="title">Account and API Keys</div>
    <div class="sub-title">Account</div>
    <div class="account">
        <div class="left"></div>
        <div class="right">
            <div class="name">Username: {admin.username}</div>
        </div>
        <button class="btn" onclick={() =>resetPassword()}>Change Password</button>
    </div>
    <div class="line"></div>
    <div class="top">
        <div class="sub-title">API Keys</div>
        <a class="btn" href="/dashboard/apiKeys/create">Create</a>
    </div>
    <Table header={header} buttons={buttons} menus={menus} checkbox={checkbox} data={data} ready={ready}/>
</div>

<style lang="scss">
  .body {
    padding: 30px 80px 30px 80px;

    .title {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .sub-title {
      font-size: 16px;
      margin-bottom: 10px;
    }

    .desc {
      line-height: 30px;
      margin-top: 10px;
    }

    .line {
      height: 1px;
      background: $outlineVariant;
      margin: 20px 0 20px 0;
    }

    .account {
      display: flex;
      padding-left: 10px;

      .left {
        height: 40px;
        width: 40px;
        border-radius: 2px;
        background-image: url("../../../components/images/img.png");
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      }

      .right {
        line-height: 40px;
        padding-left: 10px;
        flex: 1;
      }
    }

    .top {
      display: flex;

      .sub-title {
        flex: 1;
      }
    }

  }
</style>