<script>
    import CopyIcon from "components/icons/CopyIcon.svelte";
    import {Utils} from "lib";

    let {content} = $props();
    let state = $state(0);

    function copy() {
        if (state !== 0) {
            return;
        }
        state = 1;
        Utils.copyToClipboard(content).then(() => {
            state = 2;
            setTimeout(() => state = 0, 2000);
        }).catch(() => {
            state = 3;
            setTimeout(() => state = 0, 2000);
        });
    }
</script>
<div class={["copy-btn",`copy-state-${state}`]} onclick={copy}>
    <div class="copy-btn-icon">
        <CopyIcon/>
    </div>
    {#if state === 0}
        <div class="copy-btn-desc">Copy</div>
    {:else if state === 2}
        <div class="copy-btn-desc">Copied</div>
    {:else if state === 3}
        <div class="copy-btn-desc">Copied Failed</div>
    {/if}
</div>

<style lang="scss">
  .copy-btn {
    line-height: 35px;
    border: 1px solid $primaryContainer;
    display: inline-block;
    border-radius: 3px;
    cursor: pointer;
    white-space: nowrap;

    .copy-btn-icon {
      text-align: center;
      width: 30px;
      display: inline-block;
      vertical-align: top;
    }

    .copy-btn-desc {
      display: inline-block;
      vertical-align: top;
      padding: 0 15px 0 0;
    }

    &:hover {
      background-color: $primaryContainer;
      color: $onPrimaryContainer;
      border-color: $primary;
    }

    &.copy-state-2 {
      background-color: $successColorContainer;
      color: $successOnColorContainer;
      border-color: $successColor;
    }

    &.copy-state-3 {
      background-color: $errorContainer;
      color: $onErrorContainer;
      border-color: $error;
    }
  }
</style>