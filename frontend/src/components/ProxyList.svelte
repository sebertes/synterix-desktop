<script>
    import {clusters, optionsProvider, proxies, serviceInvoke, SynterixUtils} from "store/Synterix.svelte.js";
    import Table from "components/Table.svelte";
    import StartIcon from "components/icons/StartIcon.svelte";
    import QuitIcon from "components/icons/QuitIcon.svelte";
    import DeleteIcon from "components/icons/DeleteIcon.svelte";
    import EditIcon from "components/icons/EditIcon.svelte";
    import {toastProvider} from "store/Common.svelte.js";
    import {Utils} from "lib";

    let data = $state([]);
    let clusterList = $state([]);

    let header = [
        {name: "Status", key: "status", align: "left", width: "110px"},
        {name: "Name", key: "name", align: "left", width: "130px"},
        {name: "Description", key: "description", align: "left"},
        {name: "Cluster", key: "cluster", align: "left"},
        {name: "Type", key: "targetType", align: "left"},
        {name: "Target", key: "target", align: "left"},
        {name: "LocalPort", key: "localPort", align: "right"},
    ];
    let buttons = [];
    let menus = $state([
        {
            label: 'Start Proxy',
            icon: StartIcon,
            type: 'active',
            typeName: "control",
            action: async (id) => {
                await proxies.startProxyServer(id);
            }
        },
        {
            label: 'Config',
            icon: EditIcon,
            type: 'active',
            typeName: "edit",
            action: async (id) => {
                await optionsProvider.redirect("/dashboard/proxy/update?id=" + id);
            }
        },
        {
            label: 'Delete',
            icon: DeleteIcon,
            type: 'active',
            typeName: "delete",
            action: async (id) => {
                proxies.removeProxy(id);
            }
        }
    ]);
    let checkbox = true;

    let proxyTypes = {
        service: {
            targetType: "Service",
            getName(item, cluster) {
                return item.service;
            },
            linkType: "a",
            getTargetLink(item, cluster) {
                return `/dashboard/${cluster}/resource/Service/${item.service}`;
            }
        },
        pod: {
            targetType: "Pod",
            getName(item, cluster) {
                return item.pod;
            },
            linkType: "a",
            getTargetLink(item, cluster) {
                return `/dashboard/${cluster}/resource/Pod/${item.pod}`;
            }
        },
        path: {
            targetType: "Host",
            linkType: "none",
            getName(item, cluster) {
                return `${item.target.host}:${item.target.port}`;
            },
        },
        kube: {
            targetType: "Kubectl",
            getName(item, cluster) {
                return 'Download Kubeconfig';
            },
            linkType: "button",
            getTargetLink(item, cluster) {
                return `/dashboard/${cluster}/resource/Pod/${item.pod}`;
            }
        }
    };

    function onShowMenu(id) {
        let proxy = proxies.getProxy(id);
        let t = menus.find(a => a.typeName === 'control');
        if (proxy && t) {
            if (proxy.status === 'Running') {
                t.label = 'Stop Proxy';
                t.icon = QuitIcon;
                t.action = async (id) => {
                    await proxies.stopProxyServer(id);
                }
            } else {
                t.label = 'Start Proxy';
                t.icon = StartIcon;
                t.action = async (id) => {
                    await proxies.startProxyServer(id);
                }
            }
        }
    }

    async function download(d) {
        await proxies.downloadKubeconfig(d.id);
    }

    $effect(() => {
        proxies.keep().done(() => {
            data = proxies.data.map(a => {
                let {serviceType, cluster} = a;
                let t = clusterList.find(a => a.clusterId === cluster);
                let proxy = proxyTypes[serviceType];

                let {kubeAuth} = t || {};
                let isAdmin = kubeAuth === 'admin';
                let clusterInfo = {
                    ...t || {},
                    link: `/dashboard/${cluster}/resource/${isAdmin ? 'statistics' : 'Deployment'}`
                };
                return {
                    ...a,
                    clusterInfo,
                    targetType: proxy.targetType,
                    target: {
                        name: proxy.getName(a, cluster),
                        isLink: !!proxy.getTargetLink,
                        linkType: proxy.linkType,
                        link: proxy.getTargetLink && proxy.getTargetLink(a, cluster),
                    }
                };
            });
        });
    });
    $effect(() => {
        SynterixUtils.keep(clusters).done(() => {
            clusterList = (clusters.data || []).filter(a => a.type === 'edge');
        });
    })
</script>

{#snippet row(d)}
    {#each d.cells as c}
        <div class={['table-cell',c.align,c.key]}>
            {#if c.key === 'status'}
                <div class={['status-text',c.value==="Running"?"status-active":"status-failed"]}>{c.value}</div>
            {:else if c.key === 'host'}
                {d.host}:{d.port}
            {:else if c.key === 'name'}
                <a href="/dashboard/proxy/detail?id={d.id}">{c.value}</a>
            {:else if c.key === 'cluster'}
                <a href="{d.clusterInfo?.link}">{d.clusterInfo?.name || c.value}</a>
            {:else if c.key === 'target'}
                {#if c.value.linkType === 'a'}
                    <a href="{c.value.link}">{c.value.name}</a>
                {:else if c.value.linkType === 'button'}
                    <button class="dived linkable" onclick={()=>download(d)}>{c.value.name}</button>
                {:else}
                    {c.value.name}
                {/if}
            {:else}
                {c.value}
            {/if}
        </div>
    {/each}
{/snippet}

{#snippet leftTool()}
    <div class="title">
        <div class="label">Local Proxies</div>
        {#if data}
            <div class="num">{data.length}
                <div class="in"></div>
            </div>
        {/if}
    </div>
{/snippet}
{#snippet rightTool()}
    <div class="buttons">
        <a href="/dashboard/proxy" class="btn">Create</a>
    </div>
{/snippet}
<Table header={header}
       buttons={buttons}
       menus={menus}
       checkbox={checkbox}
       data={data}
       onShowMenu={(id) => onShowMenu(id)}
       leftToolSnippet={leftTool}
       rightToolSnippet={rightTool}
       row={row}/>

<style lang="scss">

  .title {
    font-size: 16px;
    line-height: 38px;
    display: inline-block;
    position: relative;
    margin-right: 50px;

    .num {
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      border-radius: 15px;
      margin-left: 10px;
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      overflow: hidden;

      .in {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        background: $primary;
        opacity: 0.3;
      }
    }
  }

  .buttons {
    margin-right: 10px;
  }
</style>