<script>
    import Table from "components/Table.svelte";
    import {KubeService} from "store/KubeService.svelte.js";
    import {ResourceStatistic} from "store/resource/ResourceStatistic.svelte";
    import {onMount} from "svelte";

    let {data: info} = $props();
    let data = $state([]);
    let header = [
        {name: "Severity", key: "status", align: "left", width: "150px"},
        {name: "Name", key: "name", align: "left"},
        {name: "Message", key: "namespace", align: "left", width: "330px"}
    ];
    let buttons = [];
    let menus = [];
    let statistic = $state({
        total: 0,
        age: "--",
        cpu: {capacity: 0, usage: 0, allocatable: 0, reserved: 0, percent: 0, reservedPercent: 0},
        memory: {capacity: 0, usage: 0, allocatable: 0, reserved: 0, percent: 0, reservedPercent: 0},
        pods: {total: 0, capacity: 0, percent: 0},
        deployments: {total: 0},
        nodes: {total: 0},
        version: '--'
    });
    onMount(async () => {
        let {data} = await KubeService.resourceCount.post();
        let total = 0;
        Reflect.ownKeys(data || {}).forEach(a => {
            total += data[a];
        });
        statistic.total = total;
    })
    $effect(() => {
        ResourceStatistic.ready(() => {
            let t = ResourceStatistic.getClusterStatistic();
            Object.assign(statistic, t);
        });
    })
</script>

<div class="content">
    <div class="header">
        <div class="header-title">Cluster Dashboard</div>
    </div>
    <div class="banner">The base Kubernetes Node resource represents a virtual or physical machine which hosts
        deployments. To manage the machine lifecyle, if available, go to Cluster Management.
    </div>
    <div class="line">
        <div class="item"><span>Kubernetes Version:</span><span>{statistic.version}</span></div>
        <div class="item"><span>Created:</span><span>{statistic.age}</span></div>
    </div>
    <div class="nums">
        <div class="num">
            <div class="dot">{statistic.total}</div>
            <div class="label">Total Resources</div>
        </div>
        <div class="margin"></div>
        <div class="num as-btn">
            <div class="dot">{statistic.nodes.total}</div>
            <a href="/dashboard/{info.clusterPath}/resources/nodes" class="dived label label-btn">Nodes</a>
        </div>
        <div class="margin"></div>
        <div class="num as-btn">
            <div class="dot">{statistic.deployments.total}</div>
            <a href="/dashboard/{info.clusterPath}/resources/deployments" class="dived label label-btn">Deployments</a>
        </div>
    </div>
    <div class="title">Capacity</div>
    <div class="statistics">
        <div class="statistic">
            <div class="label">Pods</div>
            <div class="desc">
                <div class="left">Used</div>
                <div class="info">{statistic.pods.total}/{statistic.pods.capacity}</div>
                <div class="right">{statistic.pods.percent}%</div>
            </div>
            <div class="bar">
                <div class="bar-in" style="width: {statistic.pods.percent}%"></div>
            </div>
        </div>
        <div class="margin"></div>
        <div class="statistic">
            <div class="label">Cores</div>
            <div class="desc">
                <div class="left">Reserved</div>
                <div class="info">{(statistic.cpu.reserved)}
                    /{(statistic.cpu.capacity)}</div>
                <div class="right">{statistic.cpu.reservedPercent}%</div>
            </div>
            <div class="bar">
                <div class="bar-in" style="width: {statistic.cpu.reservedPercent}%"></div>
            </div>
            <div class="desc">
                <div class="left">Used</div>
                <div class="info">{(statistic.cpu.usage)}
                    /{(statistic.cpu.capacity)}</div>
                <div class="right">{statistic.cpu.percent}%</div>
            </div>
            <div class="bar">
                <div class="bar-in" style="width: {statistic.cpu.percent}%"></div>
            </div>
        </div>
        <div class="margin"></div>
        <div class="statistic">
            <div class="label">Memory</div>
            <div class="desc">
                <div class="left">Reserved</div>
                <div class="info">{(statistic.memory.reserved)}
                    /{(statistic.memory.capacity)}</div>
                <div class="right">{statistic.memory.reservedPercent}%</div>
            </div>
            <div class="bar">
                <div class="bar-in" style="width: {statistic.memory.reservedPercent}%"></div>
            </div>
            <div class="desc">
                <div class="left">Used</div>
                <div class="info">{(statistic.memory.usage)}
                    /{(statistic.memory.capacity)}</div>
                <div class="right">{statistic.memory.percent}%</div>
            </div>
            <div class="bar">
                <div class="bar-in" style="width: {statistic.memory.percent}%"></div>
            </div>
        </div>
    </div>
    <div class="title">Alerts</div>
    <div class="tables">
        <Table header={header} data={data} buttons={buttons} menus={menus} checkbox={false}/>
    </div>
</div>

<style lang="scss">
  .content {
    padding: 30px 20px 20px 20px;

    .header {
      position: relative;
      border-bottom: 1px solid $outlineVariant;

      .header-title {
        font-size: 24px;
        display: inline-block;
        padding: 0 0 30px 40px;
      }
    }

    .title {
      font-size: 18px;
      margin-top: 30px;
    }

    .line {
      line-height: 50px;
      border-bottom: 1px solid $outlineVariant;
      display: flex;

      .item {
        margin-right: 60px;

        span {
          &:last-child {
            font-weight: 500;
            padding: 0 0 0 10px;
          }
        }
      }
    }

    .nums {
      display: flex;
      padding: 20px 0 20px 0;

      .margin {
        width: 10px;
      }

      .num {
        border: 1px solid $outlineVariant;
        flex: 1;
        line-height: 90px;
        position: relative;
        font-size: 20px;
        box-sizing: border-box;

        .dot {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 40px;
        }

        .label {
          text-align: center;
        }

        &.as-btn:hover {
          border: 1px solid $primary;
        }
      }
    }

    .statistics {
      display: grid;
      padding: 20px 0 20px 0;
      grid-template-columns:1fr 10px 1fr 10px 1fr;

      .statistic {
        border: 1px solid $outlineVariant;
        flex: 1;
        position: relative;
        padding: 30px;

        .label {
          font-size: 16px;
        }

        .desc {
          display: flex;
          font-size: 14px;
          margin-top: 10px;

          .left {
            font-weight: 500;
          }

          .info {
            flex: 1;
            padding: 0 0 0 10px;
            color: $outline;
          }

          .right {
            font-weight: 500;
          }
        }

        .bar {
          margin-top: 10px;
          height: 15px;
          border-radius: 10px;
          background: $outlineVariant;
          overflow: hidden;
          position: relative;

          .bar-in {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            background-color: $info;
            transition: width .5s ease-in;
          }
        }
      }
    }

    .tables {
      margin-top: 20px;
    }

    .label-btn {
      display: block;
      transition: background-color .3s ease;

      &:hover {
        background-color: $surfaceContainerLowest;
      }
    }
  }
</style>
