<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";

    let {value = $bindable([]), callback, disabled} = $props();
    let portList = $state([]);

    let protocols = [
        {name: "TCP", value: "TCP"},
        {name: "UDP", value: "UDP"}
    ];

    function add() {
        portList.push({
            id: Math.random(),
            name: "",
            port: "",
            nodePort: 80,
            targetPort: 80
        });
    }

    function remove(port) {
        portList = portList.filter(a => a.id !== port.id);
        update();
    }

    $effect(() => {
        portList = [...value.map(a => ({...a, id: Math.random()}))];
    });

    function update() {
        let t = portList.map(({name, port, nodePort, targetPort}) => {
            return {name, port, nodePort, targetPort};
        });
        callback && callback(t);
    }

</script>
<div class="section">
    <div class="title">Ports</div>
    {#each portList as port}
        <div class="block port-grid">
            <div class="field">
                <Input label="Name" bind:value={port.name} onblur={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <Input label="Node Port" bind:value={port.nodePort} onblur={()=>update()}
                       onClose={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <Input label="Port" bind:value={port.port} onblur={()=>update()}
                       onClose={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <Input label="Target Port" bind:value={port.targetPort} onblur={()=>update()}
                       onClose={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" onclick={()=>remove(port)} disabled={disabled}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add Port</button>
    </div>
</div>

<style lang="scss">
  .port-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr 80px;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>