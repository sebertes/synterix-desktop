<script>
    import Input from "components/form/Input.svelte";
    import Select from "components/form/Select.svelte";

    let {value = $bindable([]), label, callback, disabled} = $props();
    let mapList = $state([]);

    let operates = [
        {name: "in list", value: "In"},
        {name: "not in list", value: "NotIn"},
        {name: "is exists", value: "Exists"},
        {name: "is not exists", value: "DoesNotExist"}
    ];

    function add() {
        mapList.push({
            key: '',
            operator: 'In',
            values: '',
            id: Math.random()
        });
    }

    function remove(env) {
        mapList = mapList.filter(a => a.id !== env.id);
        update();
    }

    $effect(() => {
        mapList = [...value.map(a => ({...a, id: Math.random()}))];
    });

    function update() {
        let t = mapList.map(({key, values, operator}) => {
            return {key, values, operator};
        });
        callback && callback(t);
    }
</script>

<div class="section">
    {#each mapList as map}
        <div class="block env-grid">
            <div class="field">
                <Input label="Key" bind:value={map.key} onblur={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <Select options={operates} label="Operator" bind:value={map.operator} onClose={()=>update()}
                        disabled={disabled}/>
            </div>
            <div class="field">
                <Input label="Value" bind:value={map.values} onblur={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" disabled={disabled} onclick={()=>remove(map)}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" disabled={disabled} onclick={()=>add()}>Add {label || 'Rule'}</button>
    </div>
</div>

<style lang="scss">
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