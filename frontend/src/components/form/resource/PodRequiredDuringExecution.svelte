<script>
    import Input from "components/form/Input.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import Rule from "components/form/resource/Rule.svelte";
    import MultipeSelect from "components/form/MultipeSelect.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value, volumes, callback, disabled} = $props();
    let mapList = $state([]);
    let namespaces = $state([]);

    function add() {
        mapList.push({
            namespaces: [],
            topologyKey: null,
            labelSelector: {
                matchExpressions: []
            },
            id: Math.random()
        });
    }

    function remove(env) {
        mapList = mapList.filter(a => a.id !== env.id);
        update();
    }

    $effect(() => {
        ResourcesUtils.ready("Namespace", resource => {
            namespaces = resource.getAllRawList().map(a => {
                return {
                    name: a.metadata.name,
                    value: a.metadata.name
                }
            });
        })
    });
    $effect(() => {
        if (value) {
            mapList = value.map(a => {
                return {
                    namespaces: a.namespaces,
                    topologyKey: a.topologyKey,
                    labelSelector: {
                        matchExpressions: a.labelSelector?.matchExpressions || []
                    },
                    id: Math.random()
                }
            });
        }
    })

    function update() {
        let r = mapList.map(a => {
            return {
                namespaces: a.namespaces,
                topologyKey: a.topologyKey,
                labelSelector: {
                    matchExpressions: a.labelSelector?.matchExpressions || []
                },
            }
        });
        callback && callback(r);
    }
</script>

<div class="section">
    <div class="sub-title">RequiredDuringSchedulingIgnoredDuringExecution</div>
    {#each mapList as map}
        <div class="panel">
            <div class="content">
                <button class="dived item-remove" onclick={()=>remove(map)} disabled={disabled}>
                    <CrossIcon/>
                </button>
                <div class="block colum-2">
                    <div class="field">
                        <MultipeSelect options={namespaces} bind:value={map.namespaces} label="namespaces"
                                       onClose={update} disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Input label="topologyKey" bind:value={map.topologyKey} onblur={update} disabled={disabled}/>
                    </div>
                </div>
                <div class="block  colum-1">
                    <Rule label="MatchExpressions" bind:value={map.labelSelector.matchExpressions}
                          callback={v=>(map.labelSelector.matchExpressions=v)&&update()} disabled={disabled}/>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add</button>
    </div>
</div>

<style lang="scss">
  .env-grid {
    grid-template-columns: 1fr 1fr 1fr 80px;
  }

  .select-in {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 100%;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }

  .panel {
    .content {
      background-color: $surfaceContainerHigh;
      padding: 30px 20px 10px 20px;
      border-radius: 5px;
      @include elevation(2);
      position: relative;
      margin-bottom: 20px;

      .item-remove {
        position: absolute;
        top: 0;
        right: 0;
        width: 30px;
        line-height: 30px;
        text-align: center;
      }
    }
  }
</style>