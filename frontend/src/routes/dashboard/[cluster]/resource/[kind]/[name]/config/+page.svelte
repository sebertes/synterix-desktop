<script>
    import YamlForm from "components/form/YamlForm.svelte";
    import yamlLib from "js-yaml";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {data} = $props();
    let ready = $state(false);
    let target = $state(null);
    let resource = $state("");
    let handler = $state(null);

    $effect(() => {
        ResourcesUtils.ready(data.kind, r => {
            let t = r.getByName(data.name)?.raw;
            if (!t) {
                r.getHandler().gotoList();
                return;
            }
            resource = yamlLib.dump(t);
            handler = r.getHandler();
            target = t;
            ready = true;
        })
    });
</script>

<div class="content">
    {#if ready}
        {#if handler.isMultiFormDefinition()}
            <YamlForm content={resource}
                      kind={data.kind}
                      type={handler.getDefinitionType(target)}
                      editable={true}
                      disabled={true}
                      kindDefinition={handler.getFormDefinition(handler.getDefinitionType(target))}/>
        {:else}
            <YamlForm content={resource}
                      kind={data.kind}
                      disabled={true}
                      kindDefinition={handler.getFormDefinition()}/>
        {/if}
    {/if}
</div>


<style lang="scss">
  .content {
    position: absolute;
    top: 90px;
    left: 10px;
    right: 10px;
    bottom: 10px;
  }
</style>