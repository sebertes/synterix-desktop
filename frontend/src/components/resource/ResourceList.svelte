<script>
    import Table from "components/Table.svelte";
    import {cluster} from "store/Cluster.svelte.js";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {resources = []} = $props();

    let data = $state([]);
    let header = [
        {name: "State", key: "status", align: "left", width: "150px"},
        {name: "Type", key: "kind", align: "left"},
        {name: "Name", key: "name", align: "left", width: "200px"},
        {name: "Namespace", key: "namespace", align: "left"},
        {name: "Age", key: "age", align: "left"}
    ];
    let buttons = [];
    let menus = [];
    let provider = ResourcesUtils.getResourceProvider(resources);

    $effect(() => {
        provider.ready(() => {
            data = provider.getCommonDetailList();
        });
    })
</script>

{#snippet row(d)}
    {#each d.cells as c}
        <div class={['table-cell',c.align,c.key]}>
            {#if c.key === 'status'}
                <div class={['status-text',c.value.class]}>{c.value.status}</div>
                {#if c.value.showDescription}
                    <div class="row-desc-text">{c.value.description}</div>
                {/if}
            {:else if c.key === 'name'}
                <a href="/dashboard/{cluster.path}/resources/{d.kind.toLowerCase()}s/{c.value}">{c.value}</a>
            {:else}
                {c.value}
            {/if}
        </div>
    {/each}
{/snippet}

<Table header={header} data={data} buttons={buttons} menus={menus} checkbox={false} row={row}/>