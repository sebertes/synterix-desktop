<script>
    import SettingEdit from "components/SettingEdit.svelte";
    import {optionsProvider} from "store/Synterix.svelte.js";

    let {data} = $props();
    let {slug} = data;

    if (!optionsProvider.hasKey("centerTunnelUrl")) {
        optionsProvider.redirect("/setting");
    }
</script>

<SettingEdit key={slug}/>

<style lang="scss"></style>