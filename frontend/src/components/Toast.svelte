<script>
    import CheckIcon from "components/icons/CheckIcon.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import LoadingIcon from "components/icons/LoadingIcon.svelte";
    import {fade, fly} from 'svelte/transition';

    let {id, type = "success", message, top = 100} = $props();
    let out = $state(true);
</script>

<div in:fly={{y: top, duration: 300}} out:fade class={["toast",out&&"out"]} style="top:{top}px">
    <div class={["icon",type]}>
        {#if type === "success"}
            <CheckIcon/>
        {:else if type === "error"}
            <CrossIcon/>
        {:else}
            <LoadingIcon/>
        {/if}
    </div>
    <div class="message">{message}</div>
</div>

<style lang="scss">
  .toast {
    position: fixed;
    left: 50%;
    top: 100px;
    transform: translateX(-50%);
    line-height: 35px;
    border-radius: 20px;
    background: $surfaceContainerHighest;
    color: $onSurface;
    //transition: all ease-in .3s;
    display: flex;
    @include elevation(3);
    pointer-events: none;
    z-index: 999999999;

    .icon {
      width: 35px;
      text-align: center;
      font-size: 15px;
      height: 35px;

      &.success {
        color: $successColor;
      }

      &.error {
        color: $error;
      }

      &.loading {
        color: $primary;
        animation: rotator 1.4s linear infinite;
      }
    }

    .message {
      padding: 0 15px 0 0;
    }
  }
</style>