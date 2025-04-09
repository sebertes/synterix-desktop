<script>
    import {popupProvider} from "store/Common.svelte.js";
    import Popup from "components/Popup.svelte";

</script>

{#each popupProvider.list as popup}
    <Popup {...popup}/>
{/each}