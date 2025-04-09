<script>
    import Select from "components/form/Select.svelte";

    let {option, value = $bindable(''), disabled} = $props();
</script>

<div class="section">
    <div class="block colum-2">
        <Select {...option} bind:value={value} disabled={disabled}/>
    </div>
</div>