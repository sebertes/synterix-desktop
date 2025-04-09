<script>
    import {SynterixUtils, deleteEdge, clusters, optionsProvider, admin} from "store/Synterix.svelte.js";
    import Table from "components/Table.svelte";
    import DeleteIcon from "components/icons/DeleteIcon.svelte";
    import {toastProvider} from "store/Common.svelte.js";
    import EditIcon from "components/icons/EditIcon.svelte";

    let data = $state([]);

    let header = [
        {name: "Status", key: "status", align: "left", width: "110px"},
        {name: "Name", key: "name", align: "left", width: "130px"},
        {name: "EdgeId", key: "edgeId", align: "left"},
        {name: "Token", key: "token", align: "left"},
        {name: "Description", key: "description", align: "left"},
        {name: "CreatedAt", key: "createdAt", align: "right"}
    ];
    let buttons = [];
    let menus = [
        {
            label: 'Edit',
            icon: EditIcon,
            type: 'active',
            typeName: "edit",
            action: async (id) => {
                await optionsProvider.redirect("/dashboard/edges/update?id=" + id);
            }
        },
        {
            label: 'Delete',
            icon: DeleteIcon,
            type: 'active',
            action: async (id) => {
                let {code, msg} = await deleteEdge.post({id});
                if (code !== 0) {
                    toastProvider.error(msg);
                }
            }
        }
    ];
    let checkbox = true;

    $effect(() => {
        if (admin.username) {
            SynterixUtils.keep(clusters).done(() => {
                data = (clusters.data || []).filter(a => a.type === 'edge');
            });
        }
    })
</script>

{#snippet row(d)}
    {#each d.cells as c}
        <div class={['table-cell',c.align,c.key]}>
            {#if c.key === 'name'}
                {#if d.status === 'Connected'}
                    <a href="/dashboard/{d.edgeId}/resource/{c.value.auth==='admin'?'statistics':'Deployment'}">{c.value}</a>
                {:else}
                    <div class="disabled-text">{c.value}</div>
                {/if}
            {:else if c.key === 'status'}
                <div class={['status-text',c.value==="Connected"?"status-active":"status-failed"]}>{c.value}</div>
            {:else}
                {c.value}
            {/if}
        </div>
    {/each}
{/snippet}
{#snippet leftTool()}
    <div class="title">
        <div class="label">Edge Clusters</div>
        {#if data}
            <div class="num">{data.length}
                <div class="in"></div>
            </div>
        {/if}
    </div>
{/snippet}
{#snippet rightTool()}
    <div class="buttons">
        <a href="/dashboard/edges" class="btn">Register</a>
    </div>
{/snippet}

<Table header={header}
       buttons={buttons}
       menus={menus}
       checkbox={checkbox}
       data={data}
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

  .disabled-text {
    color: $outline;
  }
</style>