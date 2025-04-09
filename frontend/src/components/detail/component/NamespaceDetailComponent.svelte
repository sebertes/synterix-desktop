<script>
    import CheckIcon from "components/icons/CheckIcon.svelte";

    let {namespace} = $props();
    let pressures = $state([]);

</script>
<div class="pressure">
    {#each pressures as item}
        <div class={["pressure-item",item.status==='True'&&'error']}>
            <div class="icon">
                {#if item.status === 'True'}
                    <CheckIcon/>
                {:else}
                    <CheckIcon/>
                {/if}
            </div>
            <div class="name">{item.type}</div>
        </div>
    {/each}
</div>