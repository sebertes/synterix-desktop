<script>
    import "../style/global.scss";
    import ToastBoard from "components/ToastBoard.svelte";
    import {onMount} from "svelte";
    import {goto} from '$app/navigation';
    import {optionsProvider, themeManager} from "store/Synterix.svelte.js";
    import PopupManager from "components/PopupManager.svelte";

    let {children} = $props();

    onMount(async () => {
        let {next, redirectUrl} = await optionsProvider.valid();
        if (!next) {
            await goto(redirectUrl);
        }
    });
    $effect(() => {
        if (themeManager.isDark()) {
            document.body.setAttribute("data-theme", 'dark');
        } else {
            document.body.setAttribute("data-theme", 'light');
        }
    });
</script>

<svelte:head>
    <title>Synterix</title>
    <meta name="description" content="这Synterix"/>
</svelte:head>
{@render children()}
<ToastBoard/>
<PopupManager/>
