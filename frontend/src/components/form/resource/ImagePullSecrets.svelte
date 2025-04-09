<script>
    import MultipeSelect from "components/form/MultipeSelect.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {callback, value = $bindable(),disabled} = $props();
    let props = $state([]);
    let secretList = $state([]);

    $effect(() => {
        props = (value || []).map(a => a.name);
    });
    $effect(() => {
        ResourcesUtils.ready("Secret",secret=>{
            secretList = secret.getAllRawList().map(a => {
                return {name: a.metadata.name, value: a.metadata.name};
            });
        })
    })

    function update() {
        value = (props || []).map(a => {
            return {name: a};
        });
    }
</script>

<div class="section">
    <div class="title">Image Pull Secrets</div>
    <div class="block colum-2">
        <MultipeSelect label="Pull Secrets" bind:value={props} options={secretList}
                       onClose={update} disabled={disabled}/>
    </div>
</div>