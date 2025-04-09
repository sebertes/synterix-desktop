<script>
    import SettingEdit from "components/SettingEdit.svelte";

    let {data} = $props();
    let {slug} = data;

</script>

<SettingEdit key={slug}/>

<style lang="scss"></style>