<script>
    import Select from "components/form/Select.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value = $bindable(), disabled} = $props();
    let accounts = $state([]);

    $effect(() => {
        ResourcesUtils.ready("ServiceAccount", resource => {
            accounts = resource.getAllRawList().map(a => {
                return {name: a.metadata.name, value: a.metadata.name}
            });
        })
    })
</script>
<div class="section">
    <div class="title">Service Account</div>
    <div class="block colum-2">
        <Select label="Service Account" bind:value={value} options={accounts} disabled={disabled}/>
    </div>
</div>