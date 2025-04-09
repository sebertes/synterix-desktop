<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";
    import NameValue from "components/form/resource/NameValue.svelte";

    let {value = $bindable(), callback, disabled} = $props();
    let props = $state({});

    let schemas = [
        {value: 'HTTP', name: 'HTTP'},
        {value: 'HTTPS', name: 'HTTPS'}
    ];

    $effect(() => {
        if (!value) {
            props = {host: null, port: null, path: null, schema: null, headers: []};
        } else {
            props = {
                host: value.host,
                port: value.port,
                path: value.path,
                schema: value.schema,
                headers: value.headers || []
            };
        }
    })

    function update() {
        let r = {
            host: props.host,
            port: props.port,
            path: props.path,
            schema: props.schema,
            headers: props.headers
        };
        callback && callback(r);
    }

</script>

<div class="section">
    <div class="sub-title">HttpGet</div>
    <div class="block colum-4">
        <div class="field">
            <Input label="Host IP" bind:value={props.host} onblur={()=>update()} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="Port" bind:value={props.port} type="number" onblur={()=>update()} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="Path" bind:value={props.path} onblur={()=>update()} disabled={disabled}/>
        </div>
        <div class="field">
            <Select label="Schema" bind:value={props.schema} options={schemas} onClose={()=>update()}
                    disabled={disabled}/>
        </div>
    </div>
    <NameValue value={props.headers} label="HTTP Headers" callback={a=>props.headers = a} disabled={disabled}/>
</div>

<style lang="scss">
  .header-grid {
    grid-template-columns: 1fr 1fr 80px;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>