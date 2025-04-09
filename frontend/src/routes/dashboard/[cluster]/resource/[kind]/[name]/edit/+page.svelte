<script>
    import YamlForm from "components/form/YamlForm.svelte";
    import yamlLib from "js-yaml";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {data} = $props();
    let ready = $state(false);
    let target = $state(null);
    let resource = $state("");
    let handler = $state(null);
    let errorMsg = $state("");

    function exit() {
        handler.gotoList();
    }

    async function toSave(content) {
        let {code, msg} = await handler.create(content);
        if (code !== 0) {
            errorMsg = msg;
            return;
        }
        handler.gotoList();
    }

    $effect(() => {
        ResourcesUtils.ready(data.kind, r => {
            let t = r.getByName(data.name)?.raw;
            if (!t) {
                r.getHandler().gotoList();
                return;
            }
            handler = r.getHandler();
            resource = yamlLib.dump(t);
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
                      kindDefinition={handler.getFormDefinition(handler.getDefinitionType(target))}
                      errorMsg={errorMsg}
                      onSave={toSave}
                      scene="edit"
                      onExit={()=>exit()}/>
        {:else}
            <YamlForm content={resource}
                      kind={data.kind}
                      kindDefinition={handler.getFormDefinition()}
                      onExit={()=>exit()}
                      errorMsg={errorMsg}
                      scene="edit"
                      onSave={toSave}/>
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