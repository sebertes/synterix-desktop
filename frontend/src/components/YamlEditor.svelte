<script>
    import {YamlEditor} from "lib/YamlEditor.js";
    import {themeManager} from "store/Synterix.svelte.js";
    import {onMount} from "svelte";

    let {content, disabled} = $props();
    let container = null;
    let editor = null;

    onMount(() => {
        editor = new YamlEditor({container, content, theme: themeManager.theme, disabled});
        editor.initialize();
    });

    $effect(() => {
        editor && editor.toggleTheme(themeManager.theme);
    });
    $effect(() => {
        editor && editor.setContent(content);
    });

    export function getContent() {
        return editor.getContent();
    }
</script>

<div bind:this={container}></div>

<style lang="scss"></style>