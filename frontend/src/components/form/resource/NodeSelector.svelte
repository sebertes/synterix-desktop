<script>
    import KeyValue from "components/form/resource/KeyValue.svelte";

    let {callback, value = $bindable(),disabled} = $props();
</script>

<div class="section">
    <div class="title">Node Selector</div>
    <div class="block colum-1">
        <KeyValue bind:value={value} callback={v=>value=v} disabled={disabled}/>
    </div>
</div>