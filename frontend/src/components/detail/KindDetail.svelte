<script>
    import Tab from "components/Tab.svelte";
    import {Utils} from "lib";
    import {toastProvider} from "store/Common.svelte.js";
    import ResourceDetailHeaderSkeleton from "components/resource/skeleton/ResourceDetailHeaderSkeleton.svelte";
    import CopyBtn from "components/CopyBtn.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {kind, resourceName, action} = $props();
    let resource = $state(null);
    let resourceIntro = $state(null);
    let resourceComponents = $state([]);
    let ready = $state(false);
    let handler = $state(null);
    let detail = $state({
        intros: [],
        labels: [],
        annotations: [],
        tabs: []
    });
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

    $effect(() => {
        ResourcesUtils.getKindHandler(kind).then(h => handler = h);
    });
    $effect(() => {
        if (resource && handler) {
            detail = {
                intros: resource ? handler.getIntro(resource) : [],
                labels: resource ? handler.getLabels(resource) : [],
                annotations: resource ? handler.getAnnotations(resource) : [],
                tabs: resource ? handler.getDetailTabs(resource) : [],
            }
        }
    })
    $effect(() => {
        ResourcesUtils.ready(kind, r => {
            let b = r.getByName(resourceName);
            if (!b || !b.raw) {
                r.getHandler().gotoList();
                return;
            }
            resource = b.raw;
            resourceIntro = b.getTableRow();
            resourceComponents = r.getHandler().getDetailComponents(b);
            ready = true;
        })
    });
</script>

{#if !ready}
    <ResourceDetailHeaderSkeleton kind={kind} action={action}/>
{:else}
    <div class="workload-mid">
        {#if detail.intros.length > 0}
            <div class="intro">
                {#each detail.intros as intro}
                    <span class="key">{intro.key}:</span><span class="value">{intro.value}</span>
                {/each}
            </div>
        {/if}
        {#if detail.labels.length > 0}
            <div class="intro">
                <span class="key">Labels:</span>
                <div class="labels">
                    {#each detail.labels as label}
                        <div class="label">{label.key}:{label.value}</div>
                    {/each}
                </div>
            </div>
        {/if}
        {#if detail.annotations.length > 0}
            <div class="intro">
                <span class="key">Annotations:</span>
                <a href="#pods" class="value"
                   onclick={()=>toggleAnnotation()}>{showAnnotation ? 'Hide' : 'Show'} {detail.annotations.length}
                    annotation</a>
            </div>
            <div class={['annotations', showAnnotation ? 'show' : '']}>
                {#each detail.annotations as annotation}
                    <div class="annotation">
                        <div class="aKey">{annotation.key}</div>
                        <div class="aValue">{annotation.value}</div>
                        <div class="copy-btn">
                            <CopyBtn content={annotation.value}/>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    {#each resourceComponents as component}
        {#if component.component}
            {@const Component = component.component}
            <Component {...component.params}/>
        {/if}
    {/each}
    <div class="workload-tabs">
        <Tab tabs={detail.tabs}/>
    </div>
{/if}