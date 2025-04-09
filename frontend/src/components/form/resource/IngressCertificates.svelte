<script>
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import IngressCertificate from "components/form/resource/IngressCertificate.svelte";

    let {value = $bindable(), disabled, callback} = $props();
    let mapList = $state([]);

    $effect(() => {
        if (value) {
            mapList = (value || []).map(item => {
                return {
                    id: Math.random(),
                    hosts: item.hosts || [""],
                    secretName: item.secretName
                }
            })
        }
    });

    function add() {
        mapList.push({
            id: Math.random(),
            hosts: [""],
            secretName: ""
        });
    }

    function remove(env) {
        mapList = mapList.filter(a => a.id !== env.id);
        update();
    }

    function update() {
        value = (mapList || []).map(a => {
            return {
                hosts: a.hosts || [""],
                secretName: a.secretName
            }
        });
    }
</script>

<div class="section">
    <div class="title">Ingress TLS</div>
    {#each mapList as map}
        <div class="panel">
            <div class="content">
                <button class="dived item-remove" disabled={disabled} onclick={()=>remove(map)}>
                    <CrossIcon/>
                </button>
                <div class="block colum-1">
                    <IngressCertificate disabled={disabled}
                                        value={map}
                                        callback={v=>(Object.assign(map,v))&&update()}/>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add Rule</button>
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