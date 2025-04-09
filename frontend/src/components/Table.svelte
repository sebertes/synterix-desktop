<script>
    import DotsIcon from "./icons/DotsIcon.svelte";
    import NoRecordIcon from "./icons/NoRecordIcon.svelte";
    import {positionMenu, positionMenuContext} from "lib/position.js";
    import LoadingIcon from "components/icons/LoadingIcon.svelte";
    import ArrowUpIcon from "components/icons/ArrowUpIcon.svelte";
    import ArrowDownIcon from "components/icons/ArrowDownIcon.svelte";
    import ArrowDownIcont from "components/icons/ArrowDownIcont.svelte";
    import FlipStartIcon from "components/icons/FlipStartIcon.svelte";
    import FlipEndIcon from "components/icons/FlipEndIcon.svelte";
    import FlipArrowIcon from "components/icons/FlipArrowIcon.svelte";

    let {
        header, data, buttons, menus = [],
        onShowMenu, row, checkbox = true,
        ready = true, pageSize = 100,
        leftToolSnippet,
        rightToolSnippet
    } = $props();
    let selected = $state([]);
    let isSelectedAll = $derived.by(() => {
        return selected.length > 0 && selected.length === totalCount;
    });
    let menuState = $state({
        visible: false,
        position: {x: 0, y: 0},
        menuElement: null
    });
    let sorted = $state({
        key: "",
        direct: "desc"
    });
    let currentPage = $state(1);
    let totalCount = $derived.by(() => {
        return data.filter(a => {
            if (search) {
                return a.name.indexOf(search) !== -1;
            }
            return true;
        }).length;
    });
    let totalPage = $derived.by(() => {
        return Math.ceil(totalCount / pageSize);
    });
    let colums = $derived.by(() => {
        let items = [];
        if (checkbox) {
            items.push({width: '40px'});
        }
        items.push(...header);
        if (menus.length > 0) {
            items.push({width: '40px'});
        }
        return items.map(a => {
            return a.width ? a.width : '1fr';
        }).join(' ');
    });
    let minWith = $derived.by(() => {
        let width = 0;
        if (checkbox) {
            width += 50;
        }
        if (menus.length > 0) {
            width += 50;
        }
        header.forEach(a => {
            width += parseInt(a.width || '100') + 10;
        });
        return width;
    });
    let table = $derived.by(() => {
        let t = data.filter(a => {
            if (search) {
                return a.name.indexOf(search) !== -1;
            }
            return true;
        }).map(item => {
            return {
                ...item,
                cells: header.map(a => {
                    return {
                        value: item[a.key],
                        key: a.key,
                        align: a.align,
                        linkable: a.linkable,
                        link: a.link,
                    };
                })
            };
        });
        t = t.splice((currentPage - 1) * pageSize, pageSize);
        if (sorted.key) {
            if (sorted.direct === 'asc') {
                t.sort((a, b) => {
                    return `${a[sorted.key]}`.localeCompare(`${b[sorted.key]}`);
                });
            } else {
                t.sort((a, b) => {
                    return `${b[sorted.key]}`.localeCompare(`${a[sorted.key]}`);
                });
            }
        }
        return t;
    });
    let menuRow = $state("");
    let search = $state("");

    function sortTable(h) {
        if (sorted.key === h.key) {
            sorted.direct = sorted.direct === 'asc' ? 'desc' : 'asc';
        } else {
            sorted.key = h.key;
            sorted.direct = 'desc';
        }
    }

    function toggleRow(e, d) {
        if (e.target.closest('.event-hole')) {
            return;
        }
        if (!checkbox) {
            return;
        }
        if (selected.includes(d.id)) {
            selected.splice(selected.indexOf(d.id), 1);
        } else {
            selected.push(d.id);
        }
    }

    function toggleSelectAll(e) {
        if (!isSelectedAll) {
            selected = data.map(d => d.id);
        } else {
            selected = [];
        }
        e.stopPropagation();
    }

    function execButton(e, button) {
        if (!e.target.classList.contains('disabled') && button.action) {
            button.action([...selected]);
        }
    }

    function showMenu(e, row) {
        if (menus.length <= 0) {
            return;
        }
        onShowMenu && onShowMenu(row.id);
        menuState.visible = true;
        menuState.position = positionMenu(e.target.closest('.table-dropped'), menuState.menuElement);
        menuRow = row.id;
    }

    function showMenuContext(e, row) {
        if (menus.length <= 0) {
            return;
        }
        onShowMenu && onShowMenu(row.id);
        menuState.visible = true;
        menuState.position = positionMenuContext(e, menuState.menuElement);
        menuRow = row.id;
        e.preventDefault();
    }

    function execMenu(menu) {
        if (menu.action) {
            menu.action(menuRow, data.find(a => a.id === menuRow));
        }
        menuState.visible = false;
        menuRow = menu.id;
    }

    function eventHandler(e) {
        if (!e.target.closest('.dropdown-menu') && !(e.target.closest('.table-dropped'))) {
            menuState.visible = false;
            menuRow = null;
        }
    }

    function prevPage() {
        let t = currentPage - 1;
        if (t > 0) {
            currentPage = t;
        }
    }

    function nextPage() {
        let t = currentPage + 1;
        if (t <= totalPage) {
            currentPage = t;
        }
    }

    function toStartPage() {
        currentPage = 1;
    }

    function toEndPage() {
        currentPage = totalPage;
    }

    $effect(() => {
        if (header) {
            let t = header.find(a => !!a.sorted);
            if (t) {
                sorted.key = t.key;
                sorted.direct = t.sorted;
            }
            selected = [];
            menuState.visible = false;
            search = '';
            menuRow = '';
            currentPage = 1;
        }
    })

</script>

<svelte:window onclick={eventHandler}/>
{#if leftToolSnippet || rightToolSnippet || (buttons && buttons.length > 0)}
    <div class="tools">
        <div class="left">
            {#if leftToolSnippet}
                {@render leftToolSnippet()}
            {/if}
            <div class="btn-group">
                {#each buttons as button}
                    <button class={['btn',selected.length<=0?'disabled' : '']} onclick={(e)=>execButton(e,button)}
                            disabled={selected.length<=0}>
                        {#if button.icon}
                            {@const Component = button.icon}
                            <Component/>
                        {/if}
                        {button.label}
                    </button>
                {/each}
            </div>
            {#if selected.length > 0}
                <div class="select-count">{selected.length} selected</div>
            {/if}
        </div>
        <div class="right">
            {#if rightToolSnippet}
                {@render rightToolSnippet()}
            {/if}
            <input type="text" bind:value={search} placeholder="Search..." autocapitalize="off" autocomplete="off" spellcheck="false">
        </div>
    </div>
{/if}
<div class="table">
    <div class="table-row table-header" style="grid-template-columns:{colums};min-width:{minWith}px">
        {#if checkbox}
            <div class="table-cell" style="justify-self: center">
                <div class={["checkbox",isSelectedAll?'checked':selected.length>0?'indeterminate':'']}
                     onclick={e=>toggleSelectAll(e)}></div>
            </div>
        {/if}
        {#each header as h}
            <div class={['table-cell',h.align?h.align:'']}>
                <div class="table-header-name" onclick={()=>sortTable(h)}>
                    {h.name}
                    {#if h.sortable}
                        <div class="table-header-sorts">
                            <div class={["table-header-sorts-up",(sorted.key===h.key&&sorted.direct==='asc')&&'table-header-sorts-active']}>
                                <ArrowUpIcon/>
                            </div>
                            <div class={["table-header-sorts-up",(sorted.key===h.key&&sorted.direct==='desc')&&'table-header-sorts-active']}>
                                <ArrowDownIcont/>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
        {#if menus && menus.length > 0}
            <div class="table-cell">&nbsp;</div>
        {/if}
    </div>
    {#if !ready}
        {#each Array.from(new Array(10)).fill(0) as item}
            <div class={["table-row","relative"]} style="grid-template-columns:{colums};min-width:{minWith}px">
                {#if checkbox}
                    <div class="table-cell" style="justify-self: center">
                        <div class={['checkbox']}></div>
                    </div>
                {/if}
                {#if row}
                    {#each header as c}
                        <div class={['table-cell',c.align,c.key]}>
                            {#if c.name}
                                {@const size=Math.round(Math.random(c.name.length) * 10)}
                                {c.name.substring(0, size > 0 ? size : c.name.length)}
                            {/if}
                        </div>
                    {/each}
                {/if}
                {#if menus && menus.length > 0}
                    <div class="table-cell event-hole" style="justify-self: center">
                        <button class={["dived table-dropped"]}>
                            <DotsIcon/>
                        </button>
                    </div>
                {/if}
                <div class="sk-line-mask" style="flex: 1"></div>
            </div>
        {/each}
        <div class="loading">
            <div class="spinner" style="margin-right: 5px">
                <LoadingIcon/>
            </div>
            <div>Loading...</div>
        </div>
    {:else}
        {#if (table || []).length === 0}
            <div class="table-row-no">
                <div class="table-cell">
                    <div class="no-data">
                        <NoRecordIcon/>
                        There are no rows to show.
                    </div>
                </div>
            </div>
        {:else}
            {#each table as d}
                <div class={["table-row",selected.includes(d.id)&&'selected',d.rowOption?.className&&d.rowOption?.className]}
                     onclick={(e)=>toggleRow(e,d)}
                     oncontextmenu={e=>showMenuContext(e,d)}
                     style="grid-template-columns:{colums};min-width:{minWith}px">
                    {#if checkbox}
                        <div class="table-cell" style="justify-self: center">
                            <div class={['checkbox',selected.includes(d.id)&&'checked']}></div>
                        </div>
                    {/if}
                    {#if row}
                        {@render row(d)}
                    {:else}
                        {#each d.cells as c}
                            <div class={['table-cell',c.align,c.key]}>
                                {#if c.linkable && c.link}
                                    <a href={c.link(d)}>{c.value || '--'}</a>
                                {:else}
                                    {c.value || '--'}
                                {/if}
                            </div>
                        {/each}
                    {/if}
                    {#if menus && menus.length > 0}
                        <div class="table-cell event-hole" style="justify-self: center">
                            <button class={["dived table-dropped",menuRow===d.id&&'focus']} onclick={e=>showMenu(e,d)}>
                                <DotsIcon/>
                            </button>
                        </div>
                    {/if}
                </div>
            {/each}
        {/if}
    {/if}
</div>
<div class={["mask",menuState.visible&&'open']}></div>
<div class={["dropdown-menu popup",menuState.visible&&'open']} bind:this={menuState.menuElement}
     style="left: {menuState.position.left}px; top: {menuState.position.top}px">
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
{#if totalPage > 1}
    <div class="table-flips">
        <button class={["flip-btn dived", currentPage === 1 && 'disabled']} onclick={()=>toStartPage()}>
            <FlipStartIcon/>
        </button>
        <button class={["flip-btn dived flipped", currentPage === 1 && 'disabled']} onclick={()=>prevPage()}>
            <FlipArrowIcon/>
        </button>
        <div class="desc">{(currentPage - 1) * pageSize + 1}
            - {currentPage * pageSize < totalCount ? currentPage * pageSize : totalCount} of {totalCount}</div>
        <button class={["flip-btn dived", currentPage === totalPage && 'disabled']} onclick={()=>nextPage()}>
            <FlipArrowIcon/>
        </button>
        <button class={["flip-btn dived", currentPage === totalPage && 'disabled']} onclick={()=>toEndPage()}>
            <FlipEndIcon/>
        </button>
    </div>
{/if}

<style lang="scss">
  .tools {
    margin-top: 30px;
    margin-bottom: 20px;
    display: flex;

    .left {
      flex: 1;

      .button {
        margin-right: 10px;
      }
    }

    .right {
      display: flex;
    }

    .select-count {
      display: inline-block;
    }
  }

  .dots {
    cursor: pointer;
  }

  .no-data {
    line-height: 80px;
    text-align: center;
  }

  .table-dropped {
    width: 30px;
    text-align: center;
    line-height: 30px;
    border-radius: 3px;

    &:hover {
      background-color: $surfaceContainerHighest;
    }

    &.focus {
      background-color: $surfaceContainerHighest;
    }
  }

  .relative {
    position: relative;
  }

  .sk-line {
    width: 100%;
    background-color: transparent;
  }

  .loading {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .sk-line-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: auto;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  :global(body[data-theme="light"]) {
    .sk-line-mask {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .table-header-name {
    position: relative;

    .table-header-sorts {
      position: absolute;
      left: 100%;
      top: 0;
      bottom: 0;
      color: $outlineVariant;
      pointer-events: none;
      font-size: 20px;

      .table-header-sorts-up {
        line-height: 10px;
        height: 10px;

        &.table-header-sorts-active {
          color: $onPrimaryContainer;
        }
      }
    }
  }

  .table-flips {
    display: flex;
    justify-content: center;
    padding: 20px 0 10px 0;
    line-height: 30px;

    .flipped {
      transform: rotate(-180deg);
    }

    .desc {
      padding: 0 30px 0 30px;
    }

    .flip-btn {
      padding: 0 8px 0 8px;
      border: 1px solid $primary;
      background-color: $primaryContainer;
      margin: 0 5px 0 5px;
      border-radius: 3px;

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    overflow: hidden;

    &.open {
      display: block;
    }
  }
</style>