<script>
    import MenuIcon from "components/icons/MenuIcon.svelte";
    import HomeIcon from "components/icons/HomeIcon.svelte";
    import UserIcon from "components/icons/UserIcon.svelte";
    import SettingIcon from "components/icons/SettingIcon.svelte";
    import ApiIcon from "components/icons/ApiIcon.svelte";
    import ClusterIcon from "components/icons/ClusterIcon.svelte";
    import {clusters, synterixSocket, SynterixUtils} from "store/Synterix.svelte.js";
    import {onMount} from "svelte";
    import {locale} from "store/Locale.svelte.js";
    import {positionMenu} from "lib/position.js";
    import CheckCircleIcon from "components/icons/CheckCircleIcon.svelte";
    import {fade} from 'svelte/transition';

    let {children, data} = $props();
    let out = $state(true);
    let edgeList = $state([]);
    let central = $state(null);
    let menuState = $state({
        visible: false,
        position: {x: 0, y: 0},
        menuElement: null
    });

    function eventHandler(e) {
        let target = e.target, match = false;
        while (target) {
            if (target.classList && target.classList.contains('menu')) {
                out = !out;
                match = true;
                break;
            }
            target = target.parentNode;
        }
        if (!match) {
            out = true;
            menuState.visible = false;
        }
        if (!out) {
            if (!e.target.closest('.dropdown-menu')) {
                menuState.visible = false;
            }
        }
    }

    function toggleLocale(e) {
        menuState.visible = true;
        menuState.position = positionMenu(e.target.closest('.dropped'), menuState.menuElement);
        e.stopPropagation();
    }

    function toggleLocaleName(item) {
        locale.setLocale(item.key);
    }

    onMount(() => {
        synterixSocket.start();
    })

    $effect(() => {
        SynterixUtils.keep(clusters).done(() => {
            edgeList = (clusters.data || []).filter(a => a.type === 'edge');
            central = (clusters.data || []).find(a => a.type === 'central');
        });
    });
</script>

<svelte:window onclick={e=>eventHandler(e)}/>
<div class="home-header">
    <button class="menu dived">
        <MenuIcon/>
    </button>
    <div class="logo"></div>
    <div class="inner"></div>
    <div class="intro"></div>
</div>
<div class="home-body">
    {@render children()}
</div>
{#if !out}
    <div class="mask" in:fade out:fade></div>
{/if}
<div class={["menu-slide",out&&"out"]}>
    <div class="header">
        <button class="dived menu">
            <MenuIcon/>
        </button>
        <div class="logo"></div>
    </div>
    <div class="body">
        <a href="/dashboard" class="item">
            <div class="icon">
                <HomeIcon/>
            </div>
            <div class="label">{locale.map.home}</div>
        </a>
        <div class="title">Central Cluster</div>
        <a href="/dashboard/central/resource/{central&&central.kubeAuth==='admin'?'statistics':'deployments'}"
           class={["item",data.cluster.proxyType === 'central'&&'active']}>
            <div class="icon">
                <ClusterIcon/>
            </div>
            <div class="label">Central Cluster</div>
            <div class="check">
                <CheckCircleIcon/>
            </div>
        </a>
        {#if edgeList.length > 0}
            <div class="title">{locale.map.edgeCluster}</div>
            {#each edgeList as edge}
                {#if edge.status === 'Connected'}
                    <a href="/dashboard/{edge.edgeId}/resource/{edge.kubeAuth==='admin'?'statistics':'Deployment'}"
                       class={["item",data.cluster.proxyType === 'edge' && data.cluster.edgeId === edge.edgeId&&'active']}>
                        <div class="icon">
                            <ClusterIcon/>
                        </div>
                        <div class="label">{edge.name}</div>
                        <div class="check">
                            <CheckCircleIcon/>
                        </div>
                    </a>
                {:else}
                    <div class="item disabled-text">
                        <div class="icon">
                            <ClusterIcon/>
                        </div>
                        <div class="label">{edge.name}</div>
                    </div>
                {/if}
            {/each}
        {/if}
        <div class="title">{locale.map.configuration}</div>
        <a href="/dashboard/users" class="item">
            <div class="icon">
                <UserIcon/>
            </div>
            <div class="label">{locale.map.users}</div>
        </a>
        <a href="/dashboard/apiKeys" class="item">
            <div class="icon">
                <ApiIcon/>
            </div>
            <div class="label">{locale.map.apiKeys}</div>
        </a>
        <a href="/dashboard/setting" class="item">
            <div class="icon">
                <SettingIcon/>
            </div>
            <div class="label">{locale.map.setting}</div>
        </a>
    </div>
    <div class="bottom">
        <div class="left">
            <a href="/packages/synterix-panels/static">Get support</a>
        </div>
        <div class="right dropped">
            <a href="#locale" onclick={e=>toggleLocale(e)}>{locale.label}</a>
            <div class={["dropdown-menu popup",menuState.visible&&'visible']} bind:this={menuState.menuElement}
                 style="left:{menuState.position.left}px;top:{menuState.position.top}px">
                {#each locale.getLocaleMap() as item}
                    <a href="#{item.key}" class="item" onclick={()=>toggleLocaleName(item)}>{item.label}</a>
                {/each}
            </div>
        </div>
    </div>
</div>

<style lang="scss">
  .home-header {
    height: 50px;
    display: flex;
    background: $surfaceContainerLow;
    border-bottom: 1px solid $outlineVariant;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;

    .menu {
      line-height: 50px;
      text-align: center;
      width: 50px;
      font-size: 20px;

      svg {
        pointer-events: none;
      }

      &:hover {
        background: $surfaceContainerLowest;
      }
    }

    .logo {
      width: 120px;
      background-image: $logo;
      background-repeat: no-repeat;
      background-size: auto 26px;
      background-position: center left;
      padding-left: 45px;
      font-size: 22px;
      margin-left: 10px;
    }
  }

  .home-body {
    padding: 0;
    position: absolute;
    top: 51px;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .dt-menu {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 70px;
    background: $surfaceContainer;
    box-sizing: border-box;
    z-index: 9999;
    @include elevation(3);
    //border-right: 1px solid $outlineVariant;

    .dt-header {
      height: 30px;
    }

    .dt-body {
      position: absolute;
      top: 30px;
      left: 0;
      right: 0;
      bottom: 50px;

      .dt-item {
        line-height: 50px;
        text-align: center;
        display: block;

        .icon {
          font-size: 20px;
        }

        .dt-label {
          display: none;
        }
      }

      .dt-check {
        display: none;
      }
    }

    .dt-bottom {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }

  .menu-slide {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: $surfaceContainerLow;
    border-right: 1px solid $outlineVariant;
    @include elevation(3);
    transition: all ease-in 0.2s;
    z-index: 999999999;

    .header {
      height: 50px;
      display: flex;
      background: $surfaceContainerLow;

      .menu {
        line-height: 50px;
        text-align: center;
        width: 50px;
        font-size: 20px;

        svg {
          pointer-events: none;
        }

        &:hover {
          background: $surfaceContainerLowest;
        }
      }

      .logo {
        width: 120px;
        background-image: $logo;
        background-repeat: no-repeat;
        background-size: auto 26px;
        background-position: center left;
        padding-left: 45px;
        font-size: 22px;
        margin-left: 10px;
        transition: all ease-in 0.3s 0.3s;
      }
    }

    .body {
      border-top: 1px solid $outlineVariant;
      padding: 10px 20px 10px 20px;
      position: absolute;
      top: 50px;
      bottom: 50px;
      left: 0;
      right: 0;

      .title {
        margin: 10px 0 10px 0;
        font-size: 15px;
      }

      .item {
        display: flex;
        line-height: 35px;
        border-radius: 5px;

        .icon {
          width: 40px;
          text-align: center;
          font-size: 20px;
        }

        .label {
          flex: 1;
        }

        .check {
          width: 35px;
          text-align: center;
          color: $success;
          display: none;
        }

        &.active {
          background: linear-gradient(to right, $primaryContainer, rgba(0, 0, 0, 0));

          .check {
            display: block;
          }
        }

        &:hover {
          background: $primary;
          color: $primaryContainer;
          text-decoration: none;
        }

        &.disabled-text {
          color: $outline;

          &:hover {
            background: none;
            cursor: not-allowed;
          }
        }
      }
    }

    .bottom {
      line-height: 50px;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;

      .left {
        flex: 1;
      }

      a {
        padding: 0 10px 0 10px;
      }
    }

    &.out {
      left: -300px;

      .logo {
        opacity: 0;
      }
    }
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
    z-index: 999999998;
  }

  :global(body[data-theme="light"]) {
    .home-header {
      background: $surfaceContainerLowest;
    }

    .mask {
      background: rgba(255, 255, 255, 0.2);
    }
  }
</style>