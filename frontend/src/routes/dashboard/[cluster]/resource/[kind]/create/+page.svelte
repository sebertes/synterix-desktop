<script>
    import {cluster} from "store/Cluster.svelte.js";
    import YamlForm from "components/form/YamlForm.svelte";
    import {resourceContext} from "store/resource/ResourceContext.svelte.js";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {data} = $props();
    let definitionType = $state(null);
    let handler = $state(null);
    let template = $state(null);
    let errorMsg = $state(null);

    function selectDefinitionType(definition) {
        definitionType = definition.type;
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
        ResourcesUtils.getKindHandler(data.kind).then(h => handler = h);
    })
    $effect(async () => {
        if (handler) {
            let props = {
                NAMESPACE: resourceContext.namespace
            };
            let t = await handler.getTemplate(definitionType);
            t = t.replace(/\$\{[\s\S]+?\}/g, str => {
                return props[str.substring(2, str.length - 1)];
            })
            template = t;
        }
    })

</script>

<div class="workload-content">
    <div class="workload-detail-top">
        <div class="workload-detail-left">
            <div class="workload-detail-title">
                <a href="/dashboard/{cluster.path}/resource/{data.kind}">{data.kind}</a>
                <span>Create</span>
            </div>
        </div>
    </div>
    <div class="content">
        {#if handler}
            {#if !handler.isMultiFormDefinition() || definitionType}
                {#if template}
                    <YamlForm content={template}
                              saveBtnName="Create"
                              kind={data.kind}
                              kindDefinition={handler.getFormDefinition(definitionType)}
                              type={definitionType}
                              editable={false}
                              errorMsg={errorMsg}
                              onSave={toSave}
                              scene="create"
                              onBack={()=>definitionType=null}/>
                {/if}
            {:else}
                <div class="definitions-header">{handler.getMultiFormDefinitions().title}</div>
                <div class="definitions">
                    {#each handler.getMultiFormDefinitions().types as definition}
                        <div class="definition" onclick={()=>selectDefinitionType(definition)}>
                            <div class="definition-icon">{definition.icon}</div>
                            <div class="definition-base">
                                <div class="definition-title">{definition.name}</div>
                                <div class="definition-desc">{definition.description}</div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
    </div>
</div>


<style lang="scss">
  .content {
    position: absolute;
    top: 50px;
    left: 10px;
    right: 10px;
    bottom: 10px;
  }

  .definitions-header {
    line-height: 60px;
    padding: 30px 20px 0 10px;
    font-size: 20px;
  }

  .definitions {
    padding: 10px 10px 100px 10px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    .definition {
      display: flex;
      border: 1px solid $outlineVariant;
      background-color: $surfaceContainer;
      border-radius: 3px;

      .definition-icon {
        line-height: 60px;
        width: 60px;
        text-align: center;
        font-size: 25px;
        border-right: 1px solid $outlineVariant;
        background-color: $surfaceContainerLow;
      }

      .definition-base {
        padding-left: 10px;

        .definition-title {
          font-size: 16px;
          font-weight: bold;
          line-height: 40px;
        }

        .definition-desc {
          font-size: 14px;
          padding: 0 10px 10px 0;
        }
      }

      &:hover {
        background-color: $surfaceContainerHigh;
      }
    }
  }
</style>