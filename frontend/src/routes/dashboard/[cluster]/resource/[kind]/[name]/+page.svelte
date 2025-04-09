<script>
    import KindDetail from "components/detail/KindDetail.svelte";
    import YamlEditor from "components/YamlEditor.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {data} = $props();
    let content = $state({});
    let actions = $state(null);
    $effect(() => {
        ResourcesUtils.getKindHandler(data.kind).then(handler => {
            actions = handler.getActionPages();
        })
    });
    $effect(() => {
        if (actions && actions.length === 0) {
            ResourcesUtils.ready(data.kind, resource => {
                content = resource.getByName(data.name)?.raw;
            })
        }
    })
</script>
{#if actions}
    {#if actions.length > 0}
        <KindDetail kind={data.kind}
                    resourceName={data.name}
                    action={data.action}/>
    {:else}
        <YamlEditor content={content} disabled={true}/>
    {/if}
{/if}