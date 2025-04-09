<script>
    import AddIcon from "components/icons/AddIcon.svelte";
    import Container from "components/form/resource/Container.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";

    let {value = $bindable(), disabled} = $props();
    let active = $state(null);

    function create() {
        value.push({
            name: `container-${value.length}`,
            type: "container",
            children: []
        });
    }

    function remove() {
        value = value.filter(container => container.name !== active.name);
        active = value[0];
    }

    function toggleContainer(container) {
        active = container;
    }

    $effect(() => {
        if (!active) {
            active = value[0];
        }
    })
</script>

<div class="containers">
    <div class="container-desc">Containers</div>
    <div class="container-names">
        {#each value as container}
            <div class={["container-name", active&&active.name === container.name ? "active" : ""]}>
                <button class="dived" onclick={()=>toggleContainer(container)}>{container.name}</button>
                <button class="dived container-name-remove" onclick={()=>remove(container)}>
                    <CrossIcon/>
                </button>
            </div>
        {/each}
    </div>
    <div class="container-btn">
        <button class="dived container-btn-bg" onclick={create} disabled={disabled}>
            <AddIcon/>
        </button>
    </div>
</div>
{#if active}
    <Container bind:value={active} disabled={disabled}/>
{:else}
    <div class="no-record">No container to display</div>
{/if}

<style lang="scss">
  .containers {
    display: flex;
    line-height: 40px;
    border-bottom: 1px solid $outlineVariant;
    margin-bottom: 20px;

    .container-desc {
      padding: 0 10px 0 0;
      font-size: 14px;
      margin-bottom: -1px;
    }

    .container-names {
      display: flex;
      margin-bottom: -1px;

      .container-name {
        padding: 0 20px 0 20px;
        font-size: 14px;
        display: flex;
        transition: none;
        border: 1px solid transparent;

        .container-name-remove {
          width: 40px;
          text-align: center;
          margin-right: -20px;
          opacity: 0.3;
        }

        &:hover {
          .container-name-remove {
            opacity: 1;
          }
        }

        &.active {
          //background-color: $surfaceContainerHigh;
          color: $onPrimaryContainer;
          border: 1px solid $outlineVariant;
          border-bottom: 1px solid $surfaceContainer;
          border-radius: 5px 5px 0 0;
          background: linear-gradient(to bottom, $primaryContainer, rgba(0, 0, 0, 0));
        }
      }
    }

    .container-btn {
      .container-btn-bg {
        line-height: 24px;
        width: 24px;
        text-align: center;
        margin: 8px;
        border-radius: 50%;

        &:disabled {
          color: $outline;
          cursor: not-allowed;
        }
      }
    }
  }

  .no-record {
    line-height: 80px;
    text-align: center;
  }
</style>