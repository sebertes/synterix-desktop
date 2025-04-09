<script>
    import Select from "components/form/Select.svelte";

    let {callback, value = $bindable(),disabled} = $props();
    let types = [
        {name: "Always", value: "Always"},
        {name: "OnFailure", value: "OnFailure"},
        {name: "Never", value: "Never"},
    ];

</script>

<div class="section">
    <div class="title">Dns Policy</div>
    <div class="block colum-2">
        <Select label="Pull Secrets" bind:value={value} options={types} disabled={disabled}/>
    </div>
</div>