<script>
    import {getContext, onDestroy, onMount} from 'svelte';
    import {ShellTerm} from "lib/term.js";
    import DeleteIcon from "components/icons/DeleteIcon.svelte";
    import TopIcon from "components/icons/TopIcon.svelte";
    import BottomIcon from "components/icons/BottomIcon.svelte";
    import {themeManager} from "store/Synterix.svelte.js";
    import {resourceContext} from "store/resource/ResourceContext.svelte.js";

    let {id, namespace, podName, containers = []} = $props();
    let connected = $state(false);
    let containerName = $state(containers.length > 0 ? containers[0].name : null);

    let container;
    let term;

    let terms = getContext("terms");
    terms[id] = {
        resize() {
            term && term.resize();
        }
    };
    onMount(() => {
        term = new ShellTerm({
            element: container,
            socket: resourceContext.socket,
            theme: themeManager.theme,
            params: {
                namespace,
                containerName,
                podName
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
    });
    $effect(() => {
        term && term.reload({
            containerName,
            podName,
            namespace
        });
    });
    onDestroy(() => {
        term && term.dispose();
    });
</script>
<div class="term">
    <div class="term-box" bind:this={container}></div>
    <div class="tools">
        <select class="input-sm" bind:value={containerName}>
            {#each containers as container}
                <option value={container.name}>Container: {container.name}</option>
            {/each}
        </select>
        <div class="btn-group">
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
        </div>
        <div class={['state',connected&&'connected']}>{connected ? 'Connected' : 'Disconnect'}</div>
    </div>
</div>