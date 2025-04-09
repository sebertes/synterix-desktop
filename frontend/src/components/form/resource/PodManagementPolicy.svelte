<script>
    import Select from "components/form/Select.svelte";

    let {value = $bindable()} = $props();

    let options = [
        {name: "Parallel", value: "Parallel"},
        {name: "OrderedReady", value: "OrderedReady"}
    ];

</script>
<div class="section">
    <div class="title">Pod Management Policy</div>
    <div class="block colum-2">
        <Select options={options} bind:value={value}/>
    </div>
</div>