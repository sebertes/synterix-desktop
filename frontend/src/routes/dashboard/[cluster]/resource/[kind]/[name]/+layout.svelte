<script>
    import {cluster} from "store/Cluster.svelte.js";
    import ResourceDetailHeaderSkeleton from "components/resource/skeleton/ResourceDetailHeaderSkeleton.svelte";
    import DropMenu from "components/DropMenu.svelte";
    import {page} from '$app/state';
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {children, data} = $props();
    let resource = $state(null);
    let resourceIntro = $state(null);
    let ready = $state(false);
    let dropMenus = $state([]);
    let links = $state([]);
    let action = $derived.by(() => {
        return page.url.pathname.split("/")[6];
    });

    function onShowMenu() {
        ResourcesUtils.getKindHandler(data.kind).then(kind=>{
            kind.onShowDropMenu(dropMenus, resource);
        })
    }

    $effect(() => {
        ResourcesUtils.ready(data.kind, kind => {
            let b = kind.getByName(data.name);
            if (!b || !b.raw) {
                kind.getHandler().gotoList();
                return;
            }
            resource = b.raw;
            resourceIntro = b.getTableRow();
            dropMenus = kind.getHandler().getDetailDropManus(b.raw);
            links = kind.getHandler().getActionPages(b.raw).map(a => {
                return {
                    name: a.name,
                    href: `/dashboard/${cluster.path}/resource/${data.kind}/${data.name}/${a.path}`,
                    active: data.action === a.path
                };
            })
            ready = true;
        })
    });
</script>

{#if !ready}
    <ResourceDetailHeaderSkeleton action={action} kind={data.kind}/>
{:else}
    <div class="workload-content">
        <div class="workload-detail-top">
            <div class="workload-detail-top-in">
                <div class="workload-detail-left">
                    <div class="workload-detail-title">
                        <a href="/dashboard/{cluster.path}/resource/{data.kind}">{data.kind}</a>
                        {#if !['clone', 'clonee'].includes(action)}
                            <span>{resource ? resource.metadata.name : '--'}</span>
                            {#if resourceIntro && resourceIntro.status}
                                <span class={["status-text","large", resourceIntro.status.className||resourceIntro.status.class]}>{resourceIntro.status.status}</span>
                            {/if}
                        {:else}
                            <span>Clone for {resource ? resource.metadata.name : '--'}</span>
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
                {#if !['edit', 'clone', 'yamle', 'clonee'].includes(action)}
                    <div class="workload-detail-right">
                        <div class="btn-group">
                            {#each links as link}
                                <a href={link.href} class={['btn',link.active&&'hover']}>{link.name}</a>
                            {/each}
                        </div>
                        <DropMenu
                                menus={dropMenus}
                                target={resource.metadata.name}
                                onShowMenu={()=>onShowMenu()}/>
                    </div>
                {/if}
            </div>
            {#if resourceIntro.status && resourceIntro.status && resourceIntro.status.showDescription&&resourceIntro.status.message}
                <div class="workload-banner">{resourceIntro.status.message}</div>
            {/if}
        </div>
        {@render children()}
    </div>
{/if}

<style lang="scss">
  .workload-banner {
    padding: 10px 10px 10px 15px;
    background-color: $infoColorContainer;
    color: $infoOnColorContainer;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      right: 100%;
      top: 0;
      bottom: 0;
      width: 5px;
      background-color: $infoColor;
      transform: translateX(5px);
    }
  }
</style>
