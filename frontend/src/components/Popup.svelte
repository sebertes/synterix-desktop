<script>
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import {popupProvider} from "store/Common.svelte.js";
    import {fade, fly} from 'svelte/transition';

    let {id, width = '70%', height = 'auto', title, component, options = {}} = $props();
    let popupId = id;

    let ops = $derived.by(() => ({...options, popupId}));

    function close() {
        popupProvider.close(id);
    }
</script>

<div class="popups">
    <div class="popup-mask" in:fade out:fade onclick={()=>close()}></div>
    <div class="popup-box" in:fly={{y: 200, duration: 300}} out:fade style="width: {width};height:{height}">
        <div class="popup-box-title">
            <div class="text">{title}</div>
            <button class="dived icon" onclick={()=>close()}>
                <CrossIcon/>
            </button>
        </div>
        <div class="popup-box-body">
            {#if component}
                {@const Component = component}
                <Component {...ops}/>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
  .popups {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999999;

    .popup-mask {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    }

    .popup-box {
      width: 80%;
      border-radius: 5px;
      background: $surfaceContainer;
      //border: 1px solid $outlineVariant;
      @include elevation(3);
      position: relative;

      .popup-box-title {
        line-height: 50px;
        display: flex;
        font-size: 16px;
        font-weight: 500;

        .text {
          flex: 1;
          padding: 0 0 0 15px;
        }

        .icon {
          width: 50px;
          text-align: center;
          height: 50px;
        }
      }

      .popup-box-body {
        padding: 10px;
        background: $surfaceContainerLow
      }
    }
  }
</style>