<script>
    import Input from "components/form/Input.svelte";
    import Select from "components/form/Select.svelte";

    let {value, callback, disabled} = $props();

    let types = [
        {name: 'DirectoryOrCreate', value: 'DirectoryOrCreate'},
        {name: 'Directory', value: 'Directory'},
        {name: 'FileOrCreate', value: 'FileOrCreate'},
        {name: 'File', value: 'File'},
        {name: 'Socket', value: 'Socket'},
        {name: 'CharDevice', value: 'CharDevice'},
        {name: 'BlockDevice', value: 'BlockDevice'},
    ]

    let props = $state({
        name: "",
        hostPath: {
            path: '',
            type: false
        }
    });

    function update() {
        callback && callback({
            name: props.name,
            hostPath: {
                path: props.hostPath.path,
                type: props.hostPath.type,
            }
        });
    }

    $effect(() => {
        if (value) {
            props = {
                name: value.name,
                hostPath: {
                    path: value.hostPath.path,
                    type: value.hostPath.type,
                }
            };
        }
    })
</script>

<div class="section">
    <div class="title">HostPath</div>
    <div class="block colum-3">
        <div class="field">
            <Input label="Name" bind:value={props.name} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="path" bind:value={props.hostPath.path} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Select label="path" options={types} bind:value={props.hostPath.type} onClose={update} disabled={disabled}/>
        </div>
    </div>
</div>