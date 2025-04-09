<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";

    let {value = $bindable()} = $props();
    let props = $state({
        type: 'RollingUpdate',
        rollingUpdate: {
            maxUnavailable: null
        }
    });
    let options = [
        {name: 'RollingUpdate', value: 'RollingUpdate'},
        {name: 'OnDelete', value: 'OnDelete'}
    ];

    function update() {
        let r = {
            type: props.type,
            rollingUpdate: {
                maxUnavailable: props.rollingUpdate.maxUnavailable
            }
        }
        value = r;
    }
</script>
<div class="section">
    <div class="title">Pod Management Policy</div>
    <div class="block colum-2">
        <div class="field">
            <Select options={options} bind:value={props.type} onClose={update}/>
        </div>
        <div class="field">
            <Input label="Partition" bind:value={props.rollingUpdate.maxUnavailable} onblur={update}/>
        </div>
    </div>
</div>