<script>
    import Table from "components/Table.svelte";
    import DownloadIcon from "components/icons/DownloadIcon.svelte";
    import DeleteIcon from "components/icons/DeleteIcon.svelte";
    import ShellIcon from "components/icons/ShellIcon.svelte";
    import LogIcon from "components/icons/LogIcon.svelte";
    import CheckIcon from "components/icons/CheckIcon.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import {termManager} from "store/Common.svelte.js";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {params = {}} = $props();
    let data = $state([]);

    let header = [
        {name: "State", key: "status", align: "left", width: "150px"},
        {name: "Ready", key: "ready", align: "center", width: "100px"},
        {name: "Name", key: "name", align: "left"},
        {name: "Image", key: "image", align: "left"},
        {name: "Restarts", key: "restartCount", align: "center", width: "100px"},
        {name: "Started", key: "age", align: "center", width: "100px"},
    ];
    let buttons = [];
    let menus = [
        {
            label: 'Execute ShellIcon',
            icon: ShellIcon,
            type: 'active',
            action: async (podName) => {
                let t = (data || []).find(a => a.name === podName);
                termManager.openTerm({
                    type: 'shell',
                    podName: t.podName,
                    namespace: t.namespace,
                    containers: [t]
                })
            }
        },
        {
            label: 'View Logs',
            icon: LogIcon,
            type: 'active',
            action: async (podName) => {
                let t = (data || []).find(a => a.name === podName);
                termManager.openTerm({
                    type: 'log',
                    podName: t.podName,
                    namespace: t.namespace,
                    containers: [t]
                })
            }
        },
        {
            type: 'line',
        },
        {
            label: 'DownloadIcon',
            icon: DownloadIcon,
            type: 'active',
            action: (row) => {
                console.log(row)
            }
        },
        {
            type: 'line',
        },
        {
            label: 'DeleteIcon',
            icon: DeleteIcon,
            type: 'active',
            action: row => {
                console.log(row);
            }
        }
    ];

    $effect(() => {
        ResourcesUtils.ready("Pod", (resource) => {
            let t = resource.getByName(params.podName);
            if (t) {
                data = t.getContainerTableData();
            }
        });
    })
    $inspect(data);
</script>

{#snippet row(d)}
    {#each d.cells as c}
        <div class={['table-cell',c.align,c.key]}>
            {#if c.key === 'status'}
                <div class={['status-text',c.value.class]}>{c.value.status}</div>
                {#if c.value.showDescription}
                    <div class="row-desc-text">{c.value.message}</div>
                {/if}
            {:else if c.key === 'ready'}
                {#if c.value === true}
                    <div class="success">
                        <CheckIcon/>
                    </div>
                {:else}
                    <div class="error">
                        <CrossIcon/>
                    </div>
                {/if}
            {:else}
                {c.value}
            {/if}
        </div>
    {/each}
{/snippet}

<Table header={header} data={data} buttons={buttons} menus={menus} checkbox={false} row={row}/>

<style lang="scss">
  .Running {
    border: 1px solid $successColor;
    color: $successColor;
  }

  .Terminating {
    border: 1px solid $surfaceContainerHigh;
    color: $surfaceContainerHigh;
  }

  .ImagePullBackOff, .CrashLoopBackOff, .Error, .Unschedulable {
    border: 1px solid $onError;
    color: $onError;
  }

  .success {
    color: $successColor;
    font-size: 18px;
  }

  .error {
    color: $dangerColor;
    font-size: 18px;
  }
</style>