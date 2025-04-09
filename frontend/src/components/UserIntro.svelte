<script>
    import ApiIcon from "components/icons/ApiIcon.svelte";
    import SettingIcon from "components/icons/SettingIcon.svelte";
    import UserIcon from "components/icons/UserIcon.svelte";
    import QuitIcon from "components/icons/QuitIcon.svelte";
    import {admin, go} from "store/Synterix.svelte.js";

    let {buttons} = $props();
    let showDrop = $state(false);

    function eventHandler(e) {
        let target = e.target, match = false;
        while (target) {
            if (target.classList && target.classList.contains('user-intro')) {
                showDrop = !showDrop;
                match = true;
                break;
            }
            target = target.parentNode;
        }
        if (!match) {
            showDrop = false;
        }
    }

    function quit() {
        go.quit()
    }
</script>

<svelte:window onclick={e=>eventHandler(e)}/>
<div class="top-btns">
    <div class="btns">
        {#if buttons}
            {@render buttons()}
        {/if}
        <button class="dived user-intro">i</button>
    </div>
    <div class={["drop",showDrop&&"show"]}>
        <a href="#user" class="dived user">
            <div class="text">
                <UserIcon/>
                {admin.username}
            </div>
        </a>
        <a href="/dashboard/preference" class="dived item">
            <div class="text">Preference</div>
            <div class="icon">
                <SettingIcon/>
            </div>
        </a>
        <a href="/dashboard/apiKeys" class="dived item">
            <div class="text">Api Keys</div>
            <div class="icon">
                <ApiIcon/>
            </div>
        </a>
        <a href="#user" class="dived item" onclick={quit}>
            <div class="text">Quit</div>
            <div class="icon">
                <QuitIcon/>
            </div>
        </a>
    </div>
</div>

<style lang="scss">
  .top-btns {
    position: absolute;
    top: -50px;
    right: 0;

    .btns {
      display: flex;
    }
  }

  .user-intro {
    width: 30px;
    height: 30px;
    background-color: $onPrimary;
    margin: 10px;
    border-radius: 2px;
    background-image: url("images/img.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .drop {
    position: absolute;
    top: 100%;
    right: 10px;
    background: $background;
    @include elevation(2);
    z-index: 10;
    padding: 10px 0 10px 0;
    border-radius: 5px;
    margin-top: -10px;
    display: none;
    transition: box-shadow 0.2s ease;

    &:hover {
      @include elevation(3);
    }

    .item {
      line-height: 35px;
      padding: 0 0 0 10px;
      display: flex;
      cursor: default;
      transition: background-color 0.3s ease;

      .text {
        flex: 1;
        width: 150px;
      }

      .icon {
        width: 35px;
        text-align: center;
      }

      &:hover {
        background: $primaryContainer;
        color: $onPrimaryContainer;
        text-decoration: none;
      }
    }

    .user {
      margin: 0 10px 10px 10px;
      padding: 10px 0 20px 0;
      border-bottom: 1px solid $outlineVariant;

      &:hover {
        text-decoration: none;
      }
    }

    &.show {
      display: block;
    }
  }
</style>