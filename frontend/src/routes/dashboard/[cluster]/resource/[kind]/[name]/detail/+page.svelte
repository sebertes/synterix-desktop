<script>
    import KindDetail from "components/detail/KindDetail.svelte";

    let {data} = $props();

</script>
<KindDetail kind={data.kind}
            resourceName={data.name}
            action={data.action}/>