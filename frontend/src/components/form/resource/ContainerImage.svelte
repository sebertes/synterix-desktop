<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";
    import MultipeSelect from "components/form/MultipeSelect.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {image, imagePullPolicy, callback, imagePullSecrets, disabled} = $props();
    let props = $state({});
    let secretList = $state([]);

    let options = [
        {name: "Always", value: "Always"},
        {name: "IfNotPresent", value: "IfNotPresent"},
        {name: "Never", value: "Never"}
    ];

    $effect(() => {
        props.image = image;
        props.imagePullPolicy = imagePullPolicy || 'None';
        props.imagePullSecrets = (imagePullSecrets || []).map(a => a.name);
    });
    $effect(() => {
        ResourcesUtils.ready("Secret", secret => {
            secretList = secret.getAllRawList().map(a => {
                return {name: a.metadata.name, value: a.metadata.name};
            });
        })
    })

    function update() {
        let r = {
            image: props.image,
            imagePullPolicy: props.imagePullPolicy,
            imagePullSecrets: (props.imagePullSecrets || []).map(a => {
                return {name: a};
            })
        };
        callback && callback(r);
    }
</script>

<div class="section">
    <div class="title">Image</div>
    <div class="block colum-2">
        <div class="field">
            <Input label="Container Image" bind:value={props.image} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Select label="Image Pull Policy" bind:value={props.imagePullPolicy} options={options} onClose={update}
                    disabled={disabled}/>
        </div>
        <div class="field">
            <MultipeSelect label="Pull Secrets" bind:value={props.imagePullSecrets} options={secretList}
                           onClose={update} disabled={disabled}/>
        </div>
    </div>
</div>