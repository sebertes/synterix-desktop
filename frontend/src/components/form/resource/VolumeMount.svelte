<script>
    import Input from "components/form/Input.svelte";
    import Select from "components/form/Select.svelte";
    import CheckboxToggleBtn from "components/form/CheckboxToggleBtn.svelte";
    import {getContext} from "svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";

    let {value, volumes, callback, disabled} = $props();
    let mapList = $state([]);
    let yaml = getContext("yaml");

    let volumeList = $derived.by(() => {
        return [
            ...(yaml?.spec?.template?.spec?.volumes || []).map(a => {
                return {
                    name: a.name,
                    value: a.name
                };
            }),
            ...(yaml?.spec?.volumeClaimTemplates || []).map(a => {
                return {
                    name: a.metadata.name,
                    value: a.metadata.name
                };
            })
        ];
    });
    let mountPropagations = [
        {name: 'None', value: 'None'},
        {name: 'HostToContainer', value: 'HostToContainer'},
        {name: 'Bidirectional', value: 'Bidirectional'}
    ];

    function add() {
        mapList.push({
            name: null,
            mountPath: null,
            readOnly: true,
            subPath: null,
            mountPropagation: 'None',
            subPathExpr: null,
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
                    name: a.name,
                    mountPath: a.mountPath,
                    readOnly: a.readOnly,
                    subPath: a.subPath,
                    mountPropagation: a.mountPropagation,
                    subPathExpr: a.subPathExpr,
                    id: Math.random()
                }
            });
        }
    })

    function update() {
        let r = mapList.map(a => {
            return {
                name: a.name,
                mountPath: a.mountPath,
                readOnly: a.readOnly,
                subPath: a.subPath,
                mountPropagation: a.mountPropagation,
                subPathExpr: a.subPathExpr,
            }
        });
        callback && callback(r);
    }
</script>

<div class="section">
    <div class="title">Volume Mounts</div>
    {#each mapList as map}
        <div class="panel">
            <div class="content">
                <button class="dived item-remove" disabled={disabled} onclick={()=>remove(map)}>
                    <CrossIcon/>
                </button>
                <div class="block colum-3">
                    <div class="field">
                        <Select options={volumeList} label="name" bind:value={map.name} disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Input label="mountPath" bind:value={map.mountPath} onblur={update} disabled={disabled}/>
                    </div>
                    <div class="field">
                        <div class="select-in">
                            <CheckboxToggleBtn label="Read Only" bind:value={map.readOnly} callback={update}
                                               disabled={disabled}/>
                        </div>
                    </div>
                </div>
                <div class="block colum-3">
                    <div class="field">
                        <Select options={mountPropagations} label="mountPropagation" bind:value={map.mountPropagation}
                                onClose={update} disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Input label="subPath" bind:value={map.subPath} onblur={update} disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Input label="subPathExpr" bind:value={map.subPathExpr} onblur={update} disabled={disabled}/>
                    </div>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add Mount</button>
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