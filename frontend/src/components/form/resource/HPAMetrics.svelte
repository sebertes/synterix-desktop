<script>
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import HPAMetric from "components/form/resource/HPAMetric.svelte";

    let {value = $bindable(), disabled, callback} = $props();
    let mapList = $state([]);

    $effect(() => {
        if (value) {
            mapList = value.map(item => {
                return {
                    id: Math.random(), item
                }
            })
        }
    });

    function add() {
        mapList.push({
            id: Math.random(),
            item: {
                type: 'Resource',
                resource: {
                    name: 'cpu',
                    target: {
                        type: 'AverageValue',
                        averageUtilization: null,
                        averageValue: null
                    }
                }
            }
        });
    }

    function remove(env) {
        mapList = mapList.filter(a => a.id !== env.id);
        update();
    }

    function update() {
        let t = mapList.map(a => {
            return a.item;
        });
        value = JSON.parse(JSON.stringify(t));
    }
</script>

<div class="section">
    <div class="title">Metrics</div>
    {#each mapList as map}
        <div class="panel">
            <div class="content">
                <button class="dived item-remove" disabled={disabled} onclick={()=>remove(map)}>
                    <CrossIcon/>
                </button>
                <HPAMetric value={map.item} callback={v=>(map.item=v)&&update()}/>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add Metric</button>
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