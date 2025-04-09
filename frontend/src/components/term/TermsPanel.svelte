<script>
    import {setContext} from "svelte";
    import {termManager} from "store/Common.svelte.js";
    import CloseIcon from "../icons/CloseIcon.svelte";
    import ShellIcon from "../icons/ShellIcon.svelte";
    import LogIcon from "../icons/LogIcon.svelte";
    import LogTermBox from "./LogTermBox.svelte";
    import ShellTermBox from "./ShellTermBox.svelte";
    import ArrowDownIcon from "components/icons/ArrowDownIcon.svelte";

    let panel;
    let termsProviders = {};
    let isMax = $state(false);
    setContext("terms", termsProviders);

    function closeTermById(e, id) {
        termManager.closeTerm(id);
        e.stopPropagation();
    }

    function mousedown(e) {
        e.preventDefault();
        let offset = e.clientY - panel.getBoundingClientRect().top;
        let mousemove = e => {
            let height = (window.innerHeight - e.clientY + offset);
            let max = window.innerHeight - 50;
            let min = 300;
            if (height > max) {
                height = max;
            }
            if (height < min) {
                height = min;
            }
            isMax = height === max;
            panel.style.height = height + 'px';
        };
        let mouseup = e => {
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
            Reflect.ownKeys(termsProviders).forEach(a => termsProviders[a].resize());
        };
        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    }

    function toggleWindow() {
        if (isMax) {
            panel.style.height = "300px";
            Reflect.ownKeys(termsProviders).forEach(a => termsProviders[a].resize());
            isMax = false;
            return;
        }
        panel.style.height = (window.innerHeight - 50) + "px";
        Reflect.ownKeys(termsProviders).forEach(a => termsProviders[a].resize());
        isMax = true;
    }
</script>

{#if termManager.open}
    <div class="panel" bind:this={panel}>
        <div class="header">
            <div class="bars">
                {#each termManager.list as term}
                    <div class={["bar",term.id===termManager.active&&"active"]}>
                        <div class="icon">
                            {#if term.type === "log"}
                                <LogIcon/>
                            {:else}
                                <ShellIcon/>
                            {/if}
                        </div>
                        <button class="dived name" onclick={()=>termManager.toggleTerm(term.id)}>{term.podName}</button>
                        <button class="dived close" onclick={(e)=>closeTermById(e,term.id)}>
                            <CloseIcon/>
                        </button>
                    </div>
                {/each}
            </div>
            <div class="line" onmousedown={e=>mousedown(e)}></div>
            <button class={["dived arrow",isMax&&"max"]} onclick={()=>toggleWindow()}>
                <ArrowDownIcon/>
            </button>
        </div>
        <div class="body">
            {#each termManager.list as term}
                <div class={["box",term.id===termManager.active&&"active"]}>
                    {#if term.type === 'log'}
                        <LogTermBox {...term}/>
                    {:else}
                        <ShellTermBox {...term}/>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
{/if}

<style lang="scss">
  .panel {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 300px;
    background: $surfaceContainerLowest;
    box-shadow: 0 5px 160px $background;
    z-index: 999999999;
    @include elevation(5);

    .header {
      line-height: 30px;
      display: flex;
      border-top: 1px solid $outlineVariant;
      background: $surfaceContainer;

      .line {
        flex: 1;

        &:hover {
          cursor: ns-resize;
        }
      }

      .arrow {
        width: 30px;
        text-align: center;
        transform: rotate(180deg);

        &.max {
          transform: rotate(0deg);
        }
      }

      .bars {
        display: flex;
      }

      .bar {
        display: flex;
        color: $onSurface;

        .icon {
          text-align: center;
          width: 30px;
        }

        .close {
          width: 30px;
          text-align: center;
          visibility: hidden;
        }

        &.active {
          background: $surfaceContainerLowest;
          color: $onSurface;

          .close {
            visibility: visible;
          }
        }

        &:hover {
          .close {
            visibility: visible;
          }
        }
      }
    }

    .body {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 30px;

      .box {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        display: none;

        &.active {
          display: block;
        }
      }
    }
  }
</style>