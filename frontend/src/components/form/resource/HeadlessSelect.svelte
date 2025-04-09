<script>
    import Select from "components/form/Select.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value = $bindable(), disabled} = $props();
    let accounts = $state([]);

    $effect(() => {
        ResourcesUtils.ready("Service",resource=>{
            accounts = resource.getAllRawList().filter(a => {
                return a.spec.type === 'ClusterIP' && a.spec.clusterIP === 'None';
            }).map(a => {
                return {name: a.metadata.name, value: a.metadata.name}
            });
        })
    })
</script>
<div class="section">
    <div class="title">Headless Service</div>
    <div class="block colum-2">
        <Select label="Headless Service" bind:value={value} options={accounts} disabled={disabled}/>
    </div>
</div>