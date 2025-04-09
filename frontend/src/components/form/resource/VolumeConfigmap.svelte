<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";
    import RadioGroup from "components/form/RadioGroup.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value, callback, disabled} = $props();
    let props = $state({
        name: '',
        configMap: {
            name: null,
            items: [],
            defaultMode: '0644',
            optional: false
        }
    });
    let items = $state([]);
    let configmapList = $state([]);
    let configmapKeys = $state([]);

    let options = [
        {name: "Optional:Yes", value: true},
        {name: "Optional:No", value: false}
    ];

    function add() {
        items.push({
            key: '',
            path: '',
            mode: '0644',
            id: Math.random()
        });
    }

    function remove(env) {
        items = items.filter(a => a.id !== env.id);
        update();
    }

    function update() {
        callback && callback({
            name: props.name,
            configMap: {
                name: props.configMap.name,
                defaultMode: props.configMap.defaultMode,
                optional: props.configMap.optional,
                items: items.map(a => {
                    return {
                        key: a.key,
                        path: a.path,
                        mode: a.mode
                    }
                })
            }
        });
    }

    $effect(() => {
        if (value) {
            props = {
                name: value.name,
                configMap: {
                    name: value.configMap.name,
                    defaultMode: value.configMap.defaultMode,
                    optional: value.configMap.optional,
                    items: value.configMap.items || []
                }
            };
        }
    })
    $effect(() => {
        items = props.configMap.items.map(a => {
            return {id: Math.random(), ...a};
        });
    })
    $effect(() => {
        ResourcesUtils.ready("ConfigMap",resource=>{
            configmapList = resource.getAllRawList().map(a => {
                return {
                    name: a.metadata.name,
                    value: a.metadata.name,
                    data: a.data
                }
            });
        })
    });
    $effect(() => {
        if (props.configMap.name) {
            let t = configmapList.find(a => a.name === props.configMap.name);
            if (t) {
                configmapKeys = Reflect.ownKeys(t.data).map(a => {
                    return {name: a, value: a};
                })
            }
        }
    })
</script>

<div class="section">
    <div class="title">Configmap</div>
    <div class="block colum-2">
        <div class="field">
            <Input label="Volume Name" bind:value={props.name} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Select label="ConfigMap Name" options={configmapList} bind:value={props.configMap.name} onClose={update}
                    disabled={disabled}/>
        </div>
    </div>
    <div class="block colum-2">
        <div class="field">
            <Input label="defaultMode" bind:value={props.configMap.defaultMode} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <div class="to-left">
                <RadioGroup options={options} bind:value={props.configMap.optional} callback={update}
                            disabled={disabled}/>
            </div>
        </div>
    </div>
    {#each items as item}
        <div class="block env-grid">
            <div class="field">
                <Select label="Key" options={configmapKeys} bind:value={item.key} onClose={update} disabled={disabled}/>
            </div>
            <div class="field">
                <Input label="Path" bind:value={item.path} onblur={update} disabled={disabled}/>
            </div>
            <div class="field">
                <Input label="Mode" bind:value={item.mode} onblur={update} disabled={disabled}/>
            </div>
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" onclick={()=>remove(item)} disabled={disabled}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add Item</button>
    </div>
</div>

<style lang="scss">
  .optional {
    padding-right: 10px;
  }

  .env-grid {
    grid-template-columns: 1fr 1fr 1fr 80px;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>