<script>
    import DropArrowIcon from "components/icons/DropArrowIcon.svelte";
    import Table from "components/Table.svelte";
    import {positionMenu} from "lib/position.js";
    import {cluster} from "store/Cluster.svelte.js";
    import CheckIcon from "components/icons/CheckIcon.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import ArrowRightIcon from "components/icons/ArrowRightIcon.svelte";
    import {resourceContext} from "store/resource/ResourceContext.svelte.js";
    import {toastProvider} from "store/Common.svelte.js";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {kind} = $props();
    let data = $state([]);
    let ready = $state(false);
    let menus = $state([]);
    let handler = $state(null);
    let menuState = $state({
        deploy: null,
        podList: [],
        visible: false,
        position: {x: 0, y: 0},
        menuElement: null
    });
    let scalingPodList = $derived.by(() => {
        if (menuState.deploy) {
            let t = data.find(a => a.name === menuState.deploy);
            return t?.status?.podStatusList || [];
        }
        return [];
    })

    function showScaleMenu(e, name) {
        menuState.deploy = name;
        menuState.visible = true;
        menuState.position = positionMenu(e.target.closest('.scale-dropped'), menuState.menuElement);
    }

    async function scaling(up) {
        if (menuState.deploy) {
            let {code, msg} = await handler.scaling({
                name: menuState.deploy,
                namespace: resourceContext.namespace,
                up: up,
            });
            if (code !== 0) {
                toastProvider.error(msg);
            }
        }
    }

    let eventHandler = (e) => {
        if (!e.target.closest('.scale-menu') && !(e.target.closest('.scale-dropped') || e.target.classList.contains('scale-dropped'))) {
            menuState.visible = false;
            menuState.deploy = null;
        }
    };

    $effect(() => {
        ResourcesUtils.getKindHandler(kind).then(h => handler = h);
    })
    $effect(() => {
        ResourcesUtils.wait(kind, (isReady, resource) => {
            ready = isReady;
            if (isReady) {
                data = resource.getTableList();
            }
        });
    });
    $effect(() => {
        if (handler) {
            menus = handler.getTableMenus();
        }
    })
</script>

<svelte:window onclick={eventHandler}/>
{#snippet row(d)}
    {#each d.cells as c}
        <div class={['table-cell',c.align,c.key]}>
            {#if c.key === 'publicEndpoints'}
                {#each c.value as k}
                    <div class="ep-item">{k.port}/{k.protocol}</div>
                {/each}
            {:else if c.key === 'name'}
                <a href="/dashboard/{cluster.path}/resource/{kind}/{c.value}">{c.value}</a>
            {:else if c.key === 'health' && d.status && d.status.podStatusList}
                <div class={["scale scale-dropped event-hole",d.name===menuState.deploy&&"active"]}
                     onclick={(e)=>showScaleMenu(e,d.name)}>
                    <div class="bar">
                        {#each d.status?.podStatusList as item}
                            <div class={["bar-in",item.className]} style="width: {item.ratio}%"></div>
                        {/each}
                    </div>
                    <button class="dived arrow">
                        <DropArrowIcon/>
                    </button>
                </div>
            {:else if c.key === 'status' && c.value}
                <div class={['status-text',c.value.className]}>{c.value.status}</div>
                {#if c.value.showDescription}
                    <div class="row-desc-text">{c.value.message}</div>
                {/if}
            {:else if c.key === 'default'}
                {#if c.value === true}
                    <div class="success">
                        <CheckIcon/>
                    </div>
                {:else}
                    <div class="error">
                        <CrossIcon/>
                    </div>
                {/if}
            {:else if c.key === 'target'}
                {#each c.value as item}
                    <div class="target">
                        <a href={item.url}>{item.url}</a>
                        <span><ArrowRightIcon/> </span>
                        <a href="/dashboard/{cluster.path}/resources/services/{item.service}">{item.service}</a>
                    </div>
                {/each}
                <div class="target">
                    <span>Default</span>
                    <span><ArrowRightIcon/> </span>
                    <a href="/dashboard/{cluster.path}/resources/services/{d.defaultService}">{d.defaultService}</a>
                </div>
            {:else if c.key === 'cpu'}
                <div class="k1">
                    <div class="process-bar">
                        <div class="process-bar-in" style="width: {c.value?.cpuPercent}%"></div>
                    </div>
                    <div class="percent">{c.value?.cpuPercent}%</div>
                </div>
            {:else if c.key === 'ram'}
                <div class="k1">
                    <div class="process-bar">
                        <div class="process-bar-in" style="width: {c.value?.memoryPercent}%"></div>
                    </div>
                    <div class="percent">{c.value?.memoryPercent}%</div>
                </div>
            {:else if c.key === 'pods'}
                <div class="k1">
                    <div class="process-bar">
                        <div class="process-bar-in" style="width: {c.value?.podPercent}%"></div>
                    </div>
                    <div class="percent">{c.value?.podPercent}%</div>
                </div>
            {:else}
                {c.value}
            {/if}
        </div>
    {/each}
{/snippet}
<div class="workload-content">
    <div class="workload-header">
        <div class="workload-header-title">{kind}</div>
        {#if handler}
            {@const creatable=handler.getCreatable(kind)}
            {#if creatable}
                <div class="workload-header-right">
                    <button class="btn" onclick="{() => creatable.action()}">{creatable.name}</button>
                </div>
            {/if}
        {/if}
    </div>
    <div class="workload-tables">
        {#if handler}
            <Table header={handler.getTableHeader()}
                   data={data}
                   buttons={handler.getTableButtons()}
                   menus={menus}
                   onShowMenu={(id)=>handler.onShowTableMenu(menus,id)}
                   row={row}
                   ready={ready}/>
        {/if}
    </div>
</div>
<div class={["mask",menuState.visible&&"open"]}></div>
<div class={["scale-menu",menuState.visible&&"open"]} bind:this={menuState.menuElement}
     style="left:{menuState.position.left}px;top:{menuState.position.top}px">
    {#if scalingPodList.length > 0}
        <div class="states">
            {#each scalingPodList as item}
                <div class="run"><span>{item.status}</span><span>{item.size}</span></div>
            {/each}
        </div>
    {/if}
    <div class="tools">
        <div class="label">Ratio</div>
        <button class="sbtn dived" onclick={()=>scaling(false)}>-</button>
        <div class="size">{scalingPodList[0]?.total || 0}</div>
        <button class="sbtn dived" onclick={()=>scaling(true)}>+</button>
    </div>
</div>

<style lang="scss">
  .scale-menu {
    position: fixed;
    background: $surfaceContainerHighest;
    z-index: 1000;
    padding: 10px;
    border-radius: 0 0 4px 4px;
    display: none;
    transition: box-shadow 0.3s ease, color 0.3s ease;
    border: 1px solid $outlineVariant;
    box-sizing: border-box;
    width: 152px;

    .states {
      line-height: 20px;

      .run {
        display: flex;

        span:first-child {
          flex: 1;
        }
      }
    }

    .tools {
      display: flex;
      padding: 10px 0 5px 0;
      line-height: 30px;
      margin-top: 10px;
      border-top: 1px solid $outlineVariant;

      .size {
        width: 30px;
        text-align: center;
        margin-right: -10px;
      }

      .sbtn {
        width: 30px;
        text-align: center;
        //background-color: $primaryContainer;
        border-radius: 3px;
        margin: 0 0 0 10px;
        font-size: 15px;
        box-sizing: border-box;
        border: 1px solid $primary;

        &:hover {
          background-color: $primary;
          color: $onPrimary;
        }
      }
    }

    &.open {
      display: block;
    }

    &:hover {
      //@include elevation(3);
    }
  }

  .k1 {
    white-space: nowrap;
  }

  .process-bar {
    height: 15px;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    width: 75px;
    background-color: $surfaceContainerHighest;
    display: inline-block;

    .process-bar-in {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      background-color: $info;
    }
  }

  .percent {
    display: inline-block;
  }

  .line-label {
    line-height: 25px;
    background-color: $surfaceContainerHighest;
    color: $onSurface;
    padding: 0 5px 0 5px;
    border-radius: 3px;
    margin-left: 5px;
  }

  .mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    overflow: hidden;

    &.open {
      display: block;
    }
  }
</style>