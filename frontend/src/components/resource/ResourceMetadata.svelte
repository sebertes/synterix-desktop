<script>
    import CopyIcon from "components/icons/CopyIcon.svelte";
    import {Utils} from "lib/index.js";
    import {toastProvider} from "store/Common.svelte.js";

    let {resource} = $props();
    let showAnnotation = $state(false);

    function toggleAnnotation() {
        showAnnotation = !showAnnotation;
    }

    async function copy(value) {
        let r = await Utils.copyToClipboard(value);
        if (r) {
            toastProvider.success("Value Copied");
        }
    }
</script>

{#if resource.metadata && resource.metadata.labels}
    <div class="intro">
        <span class="key">Labels:</span>
        <div class="labels">
            {#each Object.entries(resource.metadata.labels) as [key, value]}
                <div class="label">{key}:{value}</div>
            {/each}
        </div>
    </div>
{/if}
{#if resource.metadata && resource.metadata.annotations}
    <div class="intro">
        <span class="key">Annotations:</span>
        <a href="#pods" class="value"
           onclick={()=>toggleAnnotation()}>{showAnnotation ? 'Hide' : 'Show'} {Reflect.ownKeys(resource.metadata.annotations).length}
            annotation</a>
    </div>
    <div class={['annotations', showAnnotation ? 'show' : '']}>
        {#each Object.entries(resource.metadata.annotations) as [key, value]}
            <div class="annotation">
                <div class="aKey">{key}</div>
                <div class="aValue">{value}</div>
                <button class="dived copy" onclick={()=>copy(value)}>
                    <CopyIcon/>
                    Copy
                </button>
            </div>
        {/each}
    </div>
{/if}

<style lang="scss">
</style>