<script>
    import Table from "./Table.svelte";
    import DownloadIcon from "./icons/DownloadIcon.svelte";
    import DeleteIcon from "./icons/DeleteIcon.svelte";

    let header = [
        {name: "Name", key: "name"},
        {name: "Namespace", key: "namespace"},
        {name: "Data", key: "data"},
        {name: "Age", key: "age"}
    ];
    let data = $state([
        {id: "aa", name: "aa", namespace: "bb", data: "cc", age: "dd"},
        {id: "bb", name: "aa", namespace: "bb", data: "cc", age: "dd"},
        {id: "cc", name: "aa", namespace: "bb", data: "cc", age: "dd"}
    ]);
    let buttons = [
        {
            label: 'DownloadIcon',
            icon: DownloadIcon,
            action: (ids) => {
                data = data.filter(a => !ids.includes(a.id));
            }
        },
        {
            label: 'DeleteIcon',
            icon: DeleteIcon,
            action: (ids) => {
                console.log(ids);
            }
        }
    ];
    let menus = [
        {
            label: 'DownloadIcon',
            icon: DownloadIcon,
            action: (row) => {
                console.log(row)
            }
        },
        {
            label: 'DeleteIcon',
            icon: DeleteIcon,
            action: row => {
                console.log(row);
            }
        }
    ];
</script>

{#snippet row(d)}
    {#each d.cells as c}
        <th class="table-cell special">
            {c.value}
        </th>
    {/each}
{/snippet}
<div class="content">
    <div class="header">
        <div class="header-title">ConfigMaps</div>
        <div class="header-right">
            <button class="btn" onclick="{() => {}}">Create</button>
        </div>
    </div>
    <div class="tables">
        <Table header={header} data={data} buttons={buttons} menus={menus} row={row}/>
    </div>
</div>

<style lang="scss">
  .content {
    padding: 30px 20px 20px 20px;

    .header {
      position: relative;

      .header-title {
        font-size: 24px;
        display: inline-block;
      }

      .header-right {
        float: right;
      }
    }

    .tables {
      margin-top: 20px;
    }
  }
</style>