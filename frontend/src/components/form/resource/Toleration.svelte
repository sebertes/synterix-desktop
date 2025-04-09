<script>
    import Input from "components/form/Input.svelte";
    import Select from "components/form/Select.svelte";

    let {value = $bindable([]), label, disabled} = $props();
    let mapList = $state([]);

    let operates = [
        {name: "Equal", value: "Equal"},
        {name: "Exists", value: "Exists"}
    ];
    let effects = [
        {name: "All", value: null},
        {name: "NoExecute", value: "NoExecute"},
        {name: "NoSchedule", value: "NoSchedule"},
        {name: "PreferNoSchedule", value: "PreferNoSchedule"}
    ];

    function add() {
        mapList.push({
            key: '',
            operator: 'Exists',
            value: '',
            effect: null,
            tolerationSeconds: null,
            id: Math.random()
        });
    }

    function remove(env) {
        mapList = mapList.filter(a => a.id !== env.id);
        update();
    }

    $effect(() => {
        if (value) {
            mapList = [...value.map(a => ({...a, id: Math.random()}))];
        }
    });

    function update() {
        let t = mapList.map(({key, value, operator, effect, tolerationSeconds}) => {
            return {key, value, operator, effect, tolerationSeconds};
        });
        value = t;
    }
</script>

<div class="section">
    {#each mapList as map}
        <div class="block env-grid">
            <div class="block env-grid2">
                <div class="field">
                    <Input label="Key" bind:value={map.key} onblur={()=>update()} disabled={disabled}/>
                </div>
                <div class="field">
                    <Select options={operates} label="Operator" bind:value={map.operator} onClose={()=>update()}
                            disabled={disabled}/>
                </div>
                {#if map.operator === 'Equal'}
                    <div class="field">
                        <Input label="Value" bind:value={map.value} onblur={()=>update()} disabled={disabled}/>
                    </div>
                {/if}
                <div class="field">
                    <Select options={effects} label="Effect" bind:value={map.effect} onClose={()=>update()}
                            disabled={disabled}/>
                </div>
                <div class="field">
                    <Input label="Value" type="number" unit="Sec" bind:value={map.tolerationSeconds}
                           onblur={()=>update()} disabled={disabled}/>
                </div>
            </div>
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" onclick={()=>remove(map)} disabled={disabled}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add {label || 'Rule'}</button>
    </div>
</div>

<style lang="scss">
  .env-grid {
    grid-template-columns: 1fr 80px;
  }

  .env-grid2 {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    margin-bottom: 0;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>