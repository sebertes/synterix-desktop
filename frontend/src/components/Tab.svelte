<script>
    let {tabs = []} = $props();
    let activeTab = $state(tabs.length > 0 ? tabs[0].id : null);

    function toggleTab(tab) {
        activeTab = activeTab === tab.id ? null : tab.id;
    }

    $effect(() => {
        if (!activeTab) {
            activeTab = tabs.length > 0 ? tabs[0].id : null;
        }
    });
    $effect(() => {
        if (!activeTab || !tabs.find(a => a.id === activeTab)) {
            activeTab = tabs.length > 0 ? tabs[0].id : null;
        }
    })
</script>

{#if tabs && tabs.length > 0}
    <div class="header">
        {#each tabs as tab}
            <div class={["tab", activeTab === tab.id ? 'active' : '']}>
                <button class="dived tab-link" onclick={()=>toggleTab(tab)}>{tab.title}</button>
            </div>
        {/each}
    </div>
    <div class="body">
        {#each tabs as tab}
            <div class={["tab-panel", activeTab === tab.id ? 'active' : '']}>
                {#if tab.component}
                    {@const Component = tab.component}
                    <Component {...tab.params || {}}/>
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style lang="scss">
  .header {
    display: flex;
    line-height: 35px;

    .tab {
      padding: 0 10px 0 10px;

      &.active {
        background: $surfaceContainerHigh;
      }
    }
  }

  .body {
    background: $surfaceContainerHigh;

    .tab-panel {
      display: none;
      padding: 10px;

      &.active {
        display: block;
      }
    }
  }
</style>