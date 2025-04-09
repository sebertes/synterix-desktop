<script>
    import UserIntro from "components/UserIntro.svelte";
    let {children} = $props();
</script>

<UserIntro/>
{@render children()}