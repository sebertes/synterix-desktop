<script>
    import KeyValue from "components/form/resource/KeyValue.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value = $bindable({}), disabled} = $props();
    let data = $state([]);

    $effect(() => {
        ResourcesUtils.ready("Namespace", namespace => {
            data = namespace.getAllRawList().map(a => {
                return {name: a.metadata.name, value: a.metadata.name};
            });
        })
    });
</script>

<div class="section">
    <div class="block colum-1">
        <KeyValue label={'Labels'} value={value.labels} callback={v=>value.labels=v} disabled={disabled}/>
    </div>
    <div class="block colum-1">
        <KeyValue label={'Annotations'} value={value.annotations} callback={v=>value.annotations=v}
                  disabled={disabled}/>
    </div>
</div>