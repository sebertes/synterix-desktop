<script>
    import DotsIcon from "components/icons/DotsIcon.svelte";
    import {positionMenu} from "lib/position.js";

    let {btn, menus, onShowMenu, disabled, target} = $props();
    let menuState = $state({
        visible: false,
        position: {x: 0, y: 0},
        menuElement: null
    });

    let eventHandler = (e) => {
        if (!e.target.closest('.dropdown-menu')) {
            menuState.visible = false;
        }
    };

    function execMenu(menu) {
        menu.action && menu.action(target);
        menuState.visible = false;
    }

    function showMenu(e) {
        if (disabled) {
            return;
        }
        onShowMenu && onShowMenu();
        menuState.visible = true;
        menuState.position = positionMenu(e.target.closest('.dropped'), menuState.menuElement);
        e.stopPropagation();
    }
</script>

<svelte:window onclick={eventHandler}/>
<button class="btn dropped" onclick={(e)=>showMenu(e)} disabled={disabled}>
    {#if !btn}
        <DotsIcon/>
    {:else}
        {@render btn()}
    {/if}
</button>
<div class={["dropdown-menu popup",menuState.visible&&'visible']} bind:this={menuState.menuElement}
     style="left:{menuState.position.left}px;top:{menuState.position.top}px">
    {#each menus as menu}
        {#if menu.type === 'line'}
            <div class="line"></div>
        {:else}
            <a class="item" href="javascript:;" onclick={() => execMenu(menu)}>
                {#if menu.icon}
                    {@const Component = menu.icon}
                    <Component/>
                {/if}
                {menu.label}
            </a>
        {/if}
    {/each}
</div>

<style lang="scss">
  .drop-btn {
    * {
      pointer-events: none;
    }
  }

  .dropped {
    background: none;
    border: 1px solid $primary;
    display: inline-block;
    color: $primary;
  }

</style>