<script>
    import TermsPanel from "components/term/TermsPanel.svelte";
    import DropArrowIcon from "components/icons/DropArrowIcon.svelte";
    import FolderIcon from "components/icons/FolderIcon.svelte";
    import UploadIcon from "components/icons/UploadIcon.svelte";
    import ShellIcon from "components/icons/ShellIcon.svelte";
    import {termManager, eventBus, popupProvider, toastProvider} from "store/Common.svelte.js";
    import {page} from '$app/state';
    import UserIntro from "components/UserIntro.svelte";
    import {
        SynterixUtils,
        proxies,
        optionsProvider,
        go, clusters, kubeDesc
    } from "store/Synterix.svelte.js";
    import ToggleIcon from "components/icons/ToggleIcon.svelte";
    import LoadingBg from "components/images/LoadingBg.svelte";
    import ClusterIcon from "components/icons/ClusterIcon.svelte";
    import InputYaml from "components/InputYaml.svelte";
    import {resourceContext} from "store/resource/ResourceContext.svelte.js";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";
    import {cluster} from "store/Cluster.svelte.js";
    import {menuProvider} from "store/MenuProvider.svelte.js";
    import Select from "components/form/Select.svelte";
    import {fade} from 'svelte/transition';
    import ProxyIcon from "components/icons/ProxyIcon.svelte";
    import SetKubeProxy from "components/SetKubeProxy.svelte";
    import NetworkOnIcon from "components/icons/NetworkOnIcon.svelte";

    let {children, data} = $props();
    let ready = $state(false);
    let kind = $derived.by(() => {
        return page.url.pathname.split("/")[4];
    });
    let namespaceList = $state([]);
    let openBody = $state(true);
    let innerHole = $state(false);
    let edgeError = $state(false);
    let edgeErrorMsg = $state('dddd');
    let isNamespaceOpen = $state(false);
    let webEnvLock = $state(true);

    function selectNamespace(namespace) {
        resourceContext.namespace = namespace;
    }

    function handleOutside(event) {
        innerHole = !!event.target.closest('.event-hole');
    }

    async function openKubectlShell() {
        let t;
        if (cluster.type === 'central') {
            t = await kubeDesc.post({});
        } else {
            t = await kubeDesc.post({
                edgeId: cluster.edgeId
            });
        }
        let {code, data, msg} = t;
        if (code !== 0) {
            toastProvider.error(msg);
        }
        termManager.openTerm({
            type: 'shell',
            namespace: data.namespace,
            podName: data.podName,
            containers: [
                {name: data.containerName}
            ]
        });
    }

    function openKubectlProxy() {
        popupProvider.open("Set kubectl proxy", SetKubeProxy, {
            resource: {},
        }, '600px');
    }

    function toggleBody() {
        openBody = !openBody;
    }

    function goBackHome() {
        if (edgeError) {
            optionsProvider.redirect("/dashboard");
            edgeError = false;
            edgeErrorMsg = null;
        }
    }

    function openInputBox() {
        popupProvider.open("Import Yaml", InputYaml, {name: "test", label: "test"});
    }

    function refreshPage() {
        if (resourceContext.netState !== 'connected') {
            window.location.reload();
        }
    }

    $effect(() => {
        let {proxyType, edgeId} = data.cluster;
        proxies.getKubeTunnelServerInfo().then(info => {
            console.log('========== kube server info:', info)
            if (!info) {
                return true;
            } else {
                if (info.proxyType !== proxyType) {
                    return true;
                } else if (info.proxyType === 'edge' && info.edgeId !== edgeId) {
                    return true;
                }
            }
        }).then(isToggle => {
            if (isToggle) {
                return resourceContext.toggleCluster();
            }
        });
    });
    $effect(() => {
        if (resourceContext.toggling) {
            let {proxyType, edgeId} = data.cluster;
            proxies.startKubeTunnelServer(proxyType, edgeId).then(() => {
                if (!go.isGoEvn()) {
                    webEnvLock = false;
                    eventBus.emit("kubeTunnelReady");
                }
            });
        }
    })
    $effect(() => {
        SynterixUtils.keep(clusters).done(() => {
            if (clusters.data) {
                cluster.set(clusters.data.find(a => a.clusterId === data.clusterPath));
            }
        });
    });
    $effect(() => {
        ResourcesUtils.ready("Namespace", namespace => {
            let list = namespace.getRawList();
            if (!resourceContext.namespace) {
                resourceContext.namespace = list[0].metadata.name;
            }
            namespaceList = list.map(a => {
                return {name: a.metadata.name, value: a.metadata.name};
            });
        })
    });
    $effect(() => {
        if (!resourceContext.ready) {
            edgeError = false;
            edgeErrorMsg = null;
            ready = false
        }
        ResourcesUtils.ready("Namespace", () => {
            if (resourceContext.ready) {
                ready = true;
                console.log('=> Page rerender');
            }
        });
    });
    $effect(() => {
        if (resourceContext.namespace) {
            menuProvider.updateCount(resourceContext.namespace);
        }
    });
</script>

<svelte:window onclick={handleOutside}></svelte:window>
{#snippet buttons()}
    <div class={["dived tool",'network','net-'+resourceContext.netState]}>
        <button class="dived inner" onclick={()=>refreshPage()}>
            <NetworkOnIcon/>
        </button>
        <div class="tip">State:{resourceContext.netState}</div>
    </div>
    <div class="dived tool">
        <button class="dived inner" onclick={()=>openInputBox()}>
            <UploadIcon/>
        </button>
        <div class="tip">Import Yaml</div>
    </div>
    <button class="dived tool" onclick={()=>openKubectlShell()}>
        <div class="inner">
            <ShellIcon/>
        </div>
        <div class="tip">Kubectl Shell</div>
    </button>
    <button class="dived tool" onclick={()=>openKubectlProxy()}>
        <div class="inner">
            <ProxyIcon/>
        </div>
        <div class="tip">Proxy to Kubectl</div>
    </button>
{/snippet}
{#if !ready}
    <div class="body-loading">
        <div class="inner">
            <div class="bg">
                <LoadingBg/>
            </div>
            <div class="waiting">
                {#if edgeError}
                    <div class="error">{edgeErrorMsg}</div>
                    <button class="btn" onclick={goBackHome}>o back Home</button>
                {:else}
                    <div class="desc">Waiting for connect the cluster...</div>
                {/if}
            </div>
        </div>
    </div>
{:else}
    <UserIntro buttons={buttons}/>
    <div class="edge">
        <div class="edge-icon">
            <ClusterIcon/>
        </div>
        <div class="edge-name"><span>Type:</span><span>{cluster.type}</span></div>
        <div class="edge-id"><span>Cluster:</span><span>{cluster.name}</span></div>
        {#if cluster.edgeId}
            <div class="edge-id"><span>ID:</span><span>{cluster.edgeId}</span></div>
        {/if}
        <div class="edge-id"><span>KubeVersion:</span><span>{cluster.version}</span></div>
    </div>
    <div class="panel-left">
        <div class="top">
            <Select label="Namespace" options={namespaceList}
                    value={resourceContext.namespace}
                    callback={value=>selectNamespace(value)}
                    onOpen={()=>isNamespaceOpen=true}
                    onOutSide={()=>isNamespaceOpen=false}/>
        </div>
        <div class="bottom">
            {#each menuProvider.list as item}
                {#if !item.admin || (item.admin && cluster.auth === 'admin')}
                    <div class={["main-item",item.open&&"open"]}>
                        <div class={["name",item.id==='cluster'&&page.url.pathname==='/dashboard/'+cluster.path+'/resources/statistics'&&'active']}>
                            <button class="dived title"
                                    onclick={()=>menuProvider.openFirst(item.id)}>{item.name}</button>
                            <button class="dived toggle" onclick={()=>menuProvider.toggleMenu(item.id)}>
                                <DropArrowIcon/>
                            </button>
                        </div>
                        <div class="list">
                            {#each item.list as item}
                                {#if !item.admin || (item.admin && cluster.auth === 'admin')}
                                    <a href={'/dashboard/'+data.clusterPath+"/resource/"+item.kind}
                                       class={['sub-item',kind===item.kind?'active':'']}>
                                        <div class="arrow">
                                            <FolderIcon/>
                                        </div>
                                        <div class="desc">{item.name}</div>
                                        <div class="num">{item.num !== undefined ? item.num : ''}</div>
                                    </a>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
        <div class="last">v0.0.1</div>
        {#if isNamespaceOpen}
            <div class="mask" in:fade out:fade></div>
        {/if}
    </div>
    <div class={["panel-right",openBody&&"open",innerHole&&"inner-hole"]}>
        <button class="dived toggle-right" onclick={()=>toggleBody()}>
            <ToggleIcon/>
        </button>
        {@render children()}
    </div>
    <TermsPanel/>
{/if}


<style lang="scss">
  .body-loading {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: $surfaceContainerLowest;
    display: flex;
    align-items: center;
    justify-content: center;

    .inner {
      width: 30%;
    }

    .bg {
      width: 100%;
    }

    .error {
      font-size: 14px;
      color: $danger;
      margin: 10px 0 10px 0;
      line-height: 30px;
    }

    .waiting {
      text-align: center;
      padding-top: 10px;
    }

    .desc {
      font-size: 14px;
      text-align: center;
      border-top: 1px solid $outlineVariant;
      padding-top: 10px;
    }
  }

  .edge {
    position: absolute;
    top: -50px;
    left: 230px;
    z-index: 99;
    line-height: 50px;
    display: flex;

    .edge-icon {
      font-size: 16px;
      width: 25px;
      text-align: center;
      color: $primary;
    }

    .edge-id {
      margin-left: 10px;
    }

    span {
      padding: 0 0 0 5px;

      &:first-child {
        color: $secondary;
      }
    }
  }

  .tool {
    font-size: 15px;
    text-align: center;
    display: inline-block;
    cursor: pointer;
    line-height: 30px;
    padding: 10px 5px 10px 5px;
    position: relative;

    .inner {
      width: 30px;
      border-radius: 3px;

      &:hover {
        background: $primaryContainer;
      }
    }

    .tip {
      white-space: nowrap;
      position: absolute;
      top: 100%;
      z-index: 9999;
      @include elevation(3);
      padding: 0 15px 0 15px;
      line-height: 35px;
      border-radius: 3px;
      font-size: 13px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      background-color: $surfaceContainerHigh;
    }

    &:hover .tip {
      display: block;
    }
  }

  .panel-left {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 230px;
  }

  .panel-right {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: $surfaceContainerLow;
    overflow: auto;
    transition: left .3s ease-in, background-color .3s ease;
    z-index: 2;

    .toggle-right {
      line-height: 30px;
      text-align: center;
      width: 30px;
      transform: rotate(180deg);
      position: absolute;
      left: 20px;
      top: 30px;
      background-color: $primaryContainer;
      border-radius: 3px;
      z-index: 99;

      > svg {
        pointer-events: none;
      }

      &:hover {
        background-color: $primary;
        color: $onPrimary;
      }
    }

    &.open {
      left: 230px;
      border-left: 1px solid $outlineVariant;

      .toggle-right {
        transform: rotate(360deg);
      }
    }

    &.inner-hole {
      overflow: hidden;
    }
  }

  .top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 10px;
    z-index: 1;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .mask {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .bottom {
    position: absolute;
    top: 75px;
    left: 0;
    right: 0;
    bottom: 20px;
    //overflow: auto;
    will-change: transform; /* 提前告知浏览器可能的变化 */
    overflow-y: auto; /* 使用硬件加速 */
    backface-visibility: hidden;
  }

  .index {

    a {
      line-height: 35px;
      display: block;
      padding: 0 15px 0 15px;
      color: $onSurface;

      &:hover {
        background: $primary;
        color: $onPrimary;
        text-decoration: none;
      }

      &.active {
        background: $primary;
        color: $onPrimary;
        text-decoration: none;
      }
    }
  }

  .last {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    line-height: 30px;
    padding: 0 15px 0 15px;
    color: $outlineVariant;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .main-item {
    cursor: default;
    line-height: 30px;

    .name {
      padding: 0 0 0 15px;
      font-weight: 500;
      display: flex;
      line-height: 35px;
      transition: background-color .3s ease;

      .title {
        flex: 1;
      }

      .toggle {
        width: 25px;
        line-height: 25px;
        margin: 5px;
        text-align: center;
        display: inline-block;
        border-radius: 3px;

        &:hover {
          background-color: $primaryContainer;
          color: $onPrimaryContainer;
        }
      }

      &:hover {
        background: $primary;
        color: $onPrimary;
      }

      &.active {
        background: $primaryContainer;
        color: $onPrimaryContainer;
      }
    }

    .list {
      display: none;

      .sub-item {
        padding: 0 15px 0 20px;
        font-size: 13px;
        color: $onSurface;
        text-decoration: none;
        display: flex;
        align-items: center;
        transition: background-color 0.3s ease, color 0.3s ease;

        .arrow {
          width: 20px;
          text-align: center;
          color: $outlineVariant;
          transition: color 0.3s ease;
          font-size: 12px;
        }

        .desc {
          flex: 1;
        }

        .num {
          font-size: 12px;
          color: $outline;
        }

        &.active {
          background: $primaryContainer;
          color: $onPrimaryContainer;

          .arrow {
            color: $onTertiaryContainer;
          }
        }

        &:hover {
          background: $primary;
          color: $onPrimary;

          .arrow {
            color: $onTertiary;
          }
        }
      }
    }

    &.open {
      .list {
        display: block;
      }

      .name .toggle {
        transform: rotate(180deg);
      }
    }
  }

  .network {
    &.net-connected {
      color: $success;
    }

    &.net-error {
      color: $error;
    }

    &.net-closed {
      color: $outline;
    }

    &.net-reconnect {
      animation: pulse 2s infinite;
    }
  }

  @keyframes pulse {
    0% {
      color: $infoColor;
      opacity: 0.3;
    }
    30% {
      color: $outline;
      opacity: 1;
    }
    60% {
      color: $infoColor;
      opacity: 0.3;
    }
    100% {
      color: $outline;
      opacity: 1;
    }
  }

  :global(body[data-theme="light"]) {
    .panel-right {
      background: $surfaceContainerLowest;
    }

    .top {
      background: rgba(255, 255, 255, 0.1);
    }

    .last {
      background: rgba(255, 255, 255, 0.2);
    }

    .mask {
      background: rgba(255, 255, 255, 0.2);
    }
  }

</style>
