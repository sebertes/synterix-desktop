<script>
    import CheckboxToggleBtn from "components/form/CheckboxToggleBtn.svelte";

    let {value = $bindable(), option,disabled} = $props();
</script>

<div class="section">
    <div class="block colum-2">
        <CheckboxToggleBtn bind:value={value} label={option.label} disabled={disabled}/>
    </div>
</div>