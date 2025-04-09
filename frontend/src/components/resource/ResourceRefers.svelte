<script>
    import {onMount} from "svelte";
    import {KubeService} from "store/KubeService.svelte.js";
    import Table from "components/Table.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";
    import {cluster} from "store/Cluster.svelte.js";

    let {name, kind, namespace} = $props();
    let referredToByReady = $state(false);
    let refersToReady = $state(false);
    let referredToByData = $state([]);
    let refersToData = $state([]);

    let referredToByProvider = null;
    let refersToProvider = null;

    let header = [
        {name: "Status", key: "status", align: "left"},
        {name: "Type", key: "kind", align: "left"},
        {name: "Name", key: "name", align: "left"},
        {name: "Namespace", key: "namespace", align: "left"},
        {name: "Age", key: "age", align: "left"}
    ];
    let buttons = [];
    let menus = [];

    onMount(() => {
        KubeService.findRefers.post({kind, namespace, name}).then(({code, data}) => {
            if (code === 0) {
                let {referredToBy, refersTo} = data;
                if (referredToBy.length > 0) {
                    referredToByProvider = ResourcesUtils.getResourceProvider(referredToBy.map(a => ({
                        name: a.metadata.name,
                        kind: a.kind,
                        namespace: a.metadata.namespace
                    })));
                    referredToByReady = true;
                }
                if (refersTo.length > 0) {
                    refersToProvider = ResourcesUtils.getResourceProvider(refersTo.map(a => ({
                        name: a.metadata.name,
                        kind: a.kind,
                        namespace: a.metadata.namespace
                    })));
                    refersToReady = true;
                }
            }
        });
    });
    $effect(() => {
        if (referredToByReady) {
            referredToByProvider.ready(() => {
                referredToByData = referredToByProvider.getCommonDetailList();
            });
        }
        if (refersToReady) {
            refersToProvider.ready(() => {
                refersToData = refersToProvider.getCommonDetailList();
            });
        }
    })
</script>

{#snippet row(d)}
    {#each d.cells as c}
        <div class={['table-cell',c.align,c.key]}>
            {#if c.key === 'status' && c.value}
                <div class={['status-text',c.value.className]}>{c.value.status}</div>
                {#if c.value.showDescription}
                    <div class="row-desc-text">{c.value.message}</div>
                {/if}
            {:else if c.key === 'name'}
                <a href="/dashboard/{cluster.path}/resource/{d.kind}/{c.value}">{c.value}</a>
            {:else}
                {c.value}
            {/if}
        </div>
    {/each}
{/snippet}
<div class="title">Referred To By</div>
<Table header={header} buttons={buttons} menus={menus} row={row} data={referredToByData} checkbox={false}/>
<div class="title">Refers To</div>
<Table header={header} buttons={buttons} menus={menus} row={row} data={refersToData} checkbox={false}/>


<style>
    .title {
        line-height: 40px;
    }
</style>