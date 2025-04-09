<script>
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";
    import Select from "components/form/Select.svelte";

    let {value = $bindable(), disabled} = $props();
    let props = $state({
        apiVersion: "",
        kind: "",
        name: ""
    });
    let resourceList = $state([]);

    $effect(() => {
        if (value) {
            props = {
                apiVersion: value.apiVersion,
                kind: value.kind,
                name: value.name
            };
        }
    });
    $effect(() => {
        ResourcesUtils.kindsReady(["Deployment", "ReplicaSet"], map => {
            let list = [];
            map.get("Deployment").getAllRawList().map(a => {
                list.push({
                    name: `${a.kind} ${a.metadata.name}`,
                    value: a.metadata.uid,
                    kind: a.kind,
                    resource: a.metadata.name,
                    apiVersion: a.apiVersion
                })
            });
            map.get("ReplicaSet").getAllRawList().map(a => {
                list.push({
                    name: `${a.kind} ${a.metadata.name}`,
                    value: a.metadata.uid,
                    kind: a.kind,
                    resource: a.metadata.name,
                    apiVersion: a.apiVersion
                })
            });
            resourceList = list;
        })
    })

    function update() {
        let t = resourceList.find(a => a.metadata.name === props.name);
        if (t) {
            value = {
                apiVersion: t.apiVersion,
                kind: t.kind,
                name: t.name
            }
        }
    }
</script>
<div class="section">
    <div class="title">Resource Select</div>
    <div class="block colum-2">
        <Select label="Resource Select"
                bind:value={props.name}
                options={resourceList}
                disabled={disabled}
                onClose={()=>{}}/>
    </div>
</div>