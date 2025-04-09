<script>
    import KindTable from "components/detail/KindTable.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {data} = $props();
</script>
{#if ResourcesUtils.isSupport(data.kind)}
    <KindTable kind={data.kind} kindName={data.kind}/>
{:else}
    <div class="no-support">Not support resource Kind</div>
{/if}

<style lang="scss">
  .no-support {
    line-height: 300px;
    text-align: center;
  }
</style>