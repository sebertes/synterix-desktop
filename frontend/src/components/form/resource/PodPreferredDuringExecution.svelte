<script>
    import Input from "components/form/Input.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import Rule from "components/form/resource/Rule.svelte";

    let {value, volumes, callback, disabled} = $props();
    let mapList = $state([]);

    function add() {
        mapList.push({
            weight: null,
            podAffinityTerm: {
                labelSelector: {
                    matchExpressions: []
                },
                topologyKey: null
            },
            id: Math.random()
        });
    }

    function remove(env) {
        mapList = mapList.filter(a => a.id !== env.id);
        update();
    }

    $effect(() => {
        if (value) {
            mapList = value.map(a => {
                return {
                    weight: a.weight,
                    podAffinityTerm: {
                        labelSelector: {
                            matchExpressions: a.podAffinityTerm?.labelSelector?.matchExpressions || []
                        },
                        topologyKey: a.podAffinityTerm?.topologyKey
                    },
                    id: Math.random()
                }
            });
        }
    })

    function update() {
        let r = mapList.map(a => {
            return {
                weight: a.weight,
                podAffinityTerm: {
                    labelSelector: {
                        matchExpressions: a.podAffinityTerm?.labelSelector?.matchExpressions || []
                    },
                    topologyKey: a.podAffinityTerm?.topologyKey
                },
            }
        });
        callback && callback(r);
    }
</script>

<div class="section">
    <div class="sub-title">PreferredDuringSchedulingIgnoredDuringExecution</div>
    {#each mapList as map}
        <div class="panel">
            <div class="content">
                <button class="dived item-remove" onclick={()=>remove(map)} disabled={disabled}>
                    <CrossIcon/>
                </button>
                <div class="block colum-2">
                    <div class="field">
                        <Input label="Weight" bind:value={map.weight} onblur={update} disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Input label="topologyKey" bind:value={map.podAffinityTerm.topologyKey} onblur={update}
                               disabled={disabled}/>
                    </div>
                </div>
                <div class="block  colum-1">
                    <Rule label="MatchExpressions" bind:value={map.podAffinityTerm.labelSelector.matchExpressions}
                          callback={v=>(map.podAffinityTerm.labelSelector.matchExpressions=v)&&update()}
                          disabled={disabled}/>
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