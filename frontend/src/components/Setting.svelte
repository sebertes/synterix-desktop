<script>
    import EditIcon from "components/icons/EditIcon.svelte";
    import {optionsProvider} from "store/Synterix.svelte.js";

    let {editPage} = $props();
</script>

<div class="body">
    <div class="title">Advanced Settings</div>
    <div class="item">
        <div class="name">Synterix Service URL</div>
        <div class="desc">synterix remote service url</div>
        {#if optionsProvider.getValue('centerTunnelUrl')}
            <div class="value">{optionsProvider.getValue('centerTunnelUrl')}</div>
        {:else}
            <div class="plc">{optionsProvider.get('centerTunnelUrl').placeholder}</div>
        {/if}
        <a href="{editPage}/centerTunnelUrl" class="dived edit">
            <EditIcon/>
        </a>
    </div>
</div>

<style lang="scss">
  .body {
    margin: 30px 80px 30px 80px;
  }

  .title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .item {
    border: 1px solid $outlineVariant;
    padding: 20px;
    background: $surfaceContainerLow;
    position: relative;

    .desc {
      color: $secondary;
      margin: 10px 0 10px 0;
    }

    .value {
      line-height: 35px;
      padding: 10px;
      background: $background;
    }

    .plc {
      line-height: 35px;
      padding: 10px;
      background: $background;
      color: $secondary;
    }

    .edit {
      position: absolute;
      top: 10px;
      right: 10px;
      border-radius: 5px;
      line-height: 30px;
      text-align: center;
      width: 30px;
      border: 1px solid $primary;

      &:hover {
        color: $infoColorContainer;
        text-decoration: none;
      }
    }
  }
</style>