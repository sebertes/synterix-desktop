<script>
    import {onDestroy, getContext, onMount} from 'svelte';
    import {LogTerm} from "lib/term.js";
    import TopIcon from "components/icons/TopIcon.svelte";
    import BottomIcon from "components/icons/BottomIcon.svelte";
    import DeleteIcon from "components/icons/DeleteIcon.svelte";
    import DownloadIcon from "components/icons/DownloadIcon.svelte";
    import {themeManager} from "store/Synterix.svelte.js";
    import {resourceContext} from "store/resource/ResourceContext.svelte.js";

    let {id, namespace, podName, containers = []} = $props();
    let connected = $state(false);
    let options = $state({
        containerName: containers.length > 0 ? containers[0].name : null,
        sinceSeconds: null,
        tailingLines: 50,
        timestamps: false
    });

    let container, term;
    let timeRance = [
        {name: "10 Minutes", value: 60 * 10},
        {name: "30 Minutes", value: 60 * 30},
        {name: "1 Hour", value: 60 * 60},
        {name: "2 Hours", value: 60 * 60 * 2},
        {name: "6 Hours", value: 60 * 60 * 6},
        {name: "12 Hours", value: 60 * 60 * 12},
        {name: "24 Hours", value: 60 * 60 * 24},
        {name: "All", value: null}
    ];
    let lineRange = [
        {name: "500 Lines", value: 50},
        {name: "500 Lines", value: 500},
        {name: "1000 Lines", value: 1000},
        {name: "5000 Lines", value: 5000},
        {name: "10000 Lines", value: 10000},
        {name: "100000 Lines", value: 100000},
    ];

    let terms = getContext("terms");
    terms[id] = {
        resize() {
            term && term.resize();
        }
    };
    onDestroy(() => {
        term && term.dispose();
    });
    onMount(() => {
        term = new LogTerm({
            element: container,
            socket: resourceContext.socket,
            theme: themeManager.theme,
            params: {
                ...options,
                podName,
                namespace
            },
            onConnected: () => {
                connected = true;
            },
            onDisconnected: () => {
                connected = false;
            }
        });
        term.initialize();
    });
    $effect(() => {
        term && term.toggleTheme(themeManager.theme);
    })
    $effect(() => {
        term && term.reload({...options, podName, namespace});
    });
</script>
<div class="term">
    <div class="term-box" bind:this={container}></div>
    <div class="tools">
        <div class="input-group">
            <select bind:value={options.containerName} class="input-sm">
                {#each containers as container}
                    <option value={container.name}>Container:{container.name}</option>
                {/each}
            </select>
            <select bind:value={options.sinceSeconds} class="input-sm">
                {#each timeRance as item}
                    <option value={item.value}>{item.name}</option>
                {/each}
            </select>
            <select bind:value={options.tailingLines} class="input-sm">
                {#each lineRange as item}
                    <option value={item.value}>{item.name}</option>
                {/each}
            </select>
        </div>
        <div class="tool">
            <label>
                <input type="checkbox" bind:checked={options.timestamps}/>
                Timestamps
            </label>
        </div>
        <div class={['state',connected&&'connected']}>{connected ? 'Connected' : 'Disconnect'}</div>
        <div class="right btn-group">
            <button class="btn btn-sm" onclick={()=>term&&term.scrollToTop()}>
                <TopIcon/>
            </button>
            <button class="btn btn-sm" onclick={()=>term&&term.scrollToBottom()}>
                <BottomIcon/>
            </button>
            <button class="btn btn-sm" onclick="{() => term&&term.clear()}">
                <DeleteIcon/>
                Clear
            </button>
            <button class="btn btn-sm">
                <DownloadIcon/>
                Download
            </button>
        </div>
    </div>
</div>