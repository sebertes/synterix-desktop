<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";
    import KeyValue from "components/form/resource/KeyValue.svelte";
    import {getContext} from "svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value = $bindable({}), disabled} = $props();
    let data = $state([]);
    let scene = getContext("scene");
    let namespaceDisabled = $derived.by(() => {
        if (disabled) {
            return true;
        } else {
            if (scene === 'edit' || scene === 'clone') {
                return true;
            }
            return false;
        }
    });
    let nameDisabled = $derived.by(() => {
        if (disabled) {
            return true;
        } else {
            if (scene === 'clone') {
                return false;
            } else if (scene === 'edit') {
                return true;
            }
            return false;
        }
    });

    $effect(() => {
        ResourcesUtils.ready("Namespace", namespace => {
            data = namespace.getAllRawList().map(a => {
                return {name: a.metadata.name, value: a.metadata.name};
            });
        })
    });
</script>

<div class="section">
    <div class="block colum-2">
        <div class="field">
            <Select label="Namespace" bind:value={value.namespace} options={data} disabled={namespaceDisabled}/>
        </div>
        <div class="field">
            <Input label="Name" bind:value={value.name} disabled={nameDisabled}/>
        </div>
    </div>
    <div class="block colum-1">
        <KeyValue label={'Labels'} value={value.labels} callback={v=>value.labels=v} disabled={disabled}/>
    </div>
    <div class="block colum-1">
        <KeyValue label={'Annotations'} value={value.annotations} callback={v=>value.annotations=v}
                  disabled={disabled}/>
    </div>
</div>