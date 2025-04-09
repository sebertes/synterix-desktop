<script>
    import MultipeSelect from "components/form/MultipeSelect.svelte";

    let {option, value = $bindable(''), disabled} = $props();
</script>

<div class="section">
    <div class="block colum-2">
        <MultipeSelect {...option} bind:value={value} disabled={disabled}/>
    </div>
</div>