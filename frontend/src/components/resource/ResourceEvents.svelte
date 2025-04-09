<script>
    import {KubeService} from "store/KubeService.svelte.js";
    import {onMount} from "svelte";
    import Table from "components/Table.svelte";

    let {name, namespace, kind} = $props();
    let data = $state([]);

    let header = [
        {name: "Status", key: "status", align: "left"},
        {name: "Type", key: "kind", align: "left"},
        {name: "Name", key: "name", align: "left"},
        {name: "Namespace", key: "namespace", align: "left"},
        {name: "Age", key: "age", align: "left"}
    ];
    let buttons = [];
    let menus = [];

    onMount(() => {
        KubeService.findEvents.post({name, namespace, kind}).then(({code, data}) => {
            if (code === 0) {
                data = data.events;
            }
        });
    })
</script>

<Table header={header} buttons={buttons} menus={menus} data={data}/>