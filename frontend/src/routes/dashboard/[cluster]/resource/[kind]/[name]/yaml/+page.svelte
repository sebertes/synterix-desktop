<script>
    import YamlEditor from "components/YamlEditor.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {data} = $props();
    let content = $state({});

    $effect(() => {
        ResourcesUtils.ready(data.kind, resource => {
            let t = resource.getByName(data.name)?.raw;
            if (!t) {
                resource.getHandler().gotoList();
                return;
            }
            content = t;
        })
    });
</script>

<YamlEditor content={content} disabled={true}/>