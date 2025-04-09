<script>
    import DropMenu from "components/DropMenu.svelte";
    import {cluster} from "store/Cluster.svelte.js";

    let {resource, resourceIntro, links, dropMenus} = $props();
</script>

<div class="workload-detail-top">
    <div class="workload-detail-left">
        <div class="workload-detail-title">
            <a href="/dashboard/{cluster.path}/resources/{resource.kind.toLowerCase()}s">{resource.kind}s</a>
            <span>{resource ? resource.metadata.name : '--'}</span>
            {#if resourceIntro && resourceIntro.status}
                <span class={["status-text","large", resourceIntro.status.className||resourceIntro.status.class]}>{resourceIntro.status.status}</span>
            {/if}
        </div>
        <div class="workload-detail-desc">
            {#if resource && resource.metadata.namespace}
            <div class="intro">
                <span class="key">Namespace:</span><span
                    class="value">{resource ? resource.metadata.namespace : '--'}</span>
            </div>
            {/if}
            <div class="intro">
                <span class="key">Aga:</span><span
                    class="value">{resourceIntro.age ? resourceIntro.age : '--'}</span>
            </div>
        </div>
    </div>
    <div class="workload-detail-right">
        <div class="btn-group">
            {#each links as link}
                <a href={link.href} class={['btn',link.active&&'hover']}>{link.name}</a>
            {/each}
        </div>
        <DropMenu menus={dropMenus}/>
    </div>
</div>