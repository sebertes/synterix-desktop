<script>
    import Toast from "components/Toast.svelte";
    import {toastProvider} from "store/Common.svelte.js";
</script>

{#each toastProvider.list as toast}
    <Toast {...toast}/>
{/each}

<style lang="scss"></style>