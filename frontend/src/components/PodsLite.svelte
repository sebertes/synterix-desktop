<script>
    import Table from "components/Table.svelte";
    import {cluster} from "store/Cluster.svelte.js";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {params = {}} = $props();
    let data = $state([]);

    let header = [
        {name: "State", key: "status", align: "left", width: "150px"},
        {name: "Name", key: "name", align: "left"},
        {name: "Node", key: "namespace", align: "left", width: "200px"},
        {name: "Image", key: "image", align: "left"}
    ];
    let buttons = [];
    let menus = $state([]);

    $effect(() => {
        ResourcesUtils.ready("Pod", pod => {
            menus = pod.getHandler().getTableMenus();
            let list = pod.getAllList();
            if (params.nodeName) {
                data = list.filter(a => a.raw.spec.nodeName === params.nodeName).map(a => a.getTableRow());
            } else {
                data = list.filter(a => a.isMatchLabels(params.matchLabels)).map(a => a.getTableRow());
            }
        })
    })

</script>

{#snippet row(d)}
    {#each d.cells as c}
        <div class={['table-cell',c.align,c.key]}>
            {#if c.key === 'status'}
                <div class={['status-text',c.value.className]}>{c.value.status}</div>
                {#if c.value.showDescription}
                    <div class="row-desc-text">{c.value.description}</div>
                {/if}
            {:else if c.key === 'name'}
                <a href="/dashboard/{cluster.path}/resource/Pod/{c.value}">{c.value}</a>
            {:else}
                {c.value}
            {/if}
        </div>
    {/each}
{/snippet}

<Table header={header} data={data} buttons={buttons} menus={menus} checkbox={false} row={row}/>

<style lang="scss">
  .Running {
    border: 1px solid $successColor;
    color: $successColor;
  }

  .Terminating {
    border: 1px solid $surfaceContainerHigh;
    color: $surfaceContainerHigh;
  }

  .ImagePullBackOff, .CrashLoopBackOff, .Error, .Unschedulable {
    border: 1px solid $onError;
    color: $onError;
  }
</style>