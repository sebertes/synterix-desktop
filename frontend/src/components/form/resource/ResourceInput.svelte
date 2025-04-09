<script>
    import Input from "components/form/Input.svelte";

    let {option, value = $bindable(''), disabled} = $props();
</script>

<div class="section">
    <div class="block colum-2">
        <Input {...option} bind:value={value} disabled={disabled}/>
    </div>
</div>