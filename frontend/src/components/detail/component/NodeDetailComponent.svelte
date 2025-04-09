<script>
    import CheckIcon from "components/icons/CheckIcon.svelte";

    let {node} = $props();
    let pressures = $state([]);
    let podIntro = $state(null);

    $effect(() => {
        pressures = node.raw.status.conditions.filter(c => c.type.indexOf('Pressure') !== -1);
        podIntro = node.getTableRow();
    });

</script>

<div class="pressure">
    {#each pressures as item}
        <div class={["pressure-item",item.status==='True'&&'error']}>
            <div class="icon">
                {#if item.status === 'True'}
                    <CheckIcon/>
                {:else}
                    <CheckIcon/>
                {/if}
            </div>
            <div class="name">{item.type}</div>
        </div>
    {/each}
</div>
{#if podIntro}
    <div class="stat">
        <div class="stat-item">
            <div class="label">CPU</div>
            <div class="top">
                <div class="left">Used</div>
                <div class="percent">
                    <span>{podIntro.cpu.cpuUsed}</span>
                    <span>/</span>
                    <span>{podIntro.cpu.cpuTotal}</span>
                    <span>{podIntro.cpu.cpuPercent}%</span>
                </div>
            </div>
            <div class="bar">
                <div class="bar-in" style="width:{podIntro.cpu.cpuPercent}%"></div>
            </div>
        </div>
        <div class="stat-item">
            <div class="label">Memory</div>
            <div class="top">
                <div class="left">Used</div>
                <div class="percent">
                    <span>{podIntro.cpu.memoryUsed}</span>
                    <span>/</span>
                    <span>{podIntro.cpu.memoryTotal}</span>
                    <span>{podIntro.cpu.memoryPercent}%</span>
                </div>
            </div>
            <div class="bar">
                <div class="bar-in" style="width:{podIntro.cpu.memoryPercent}%"></div>
            </div>
        </div>
        <div class="stat-item">
            <div class="label">Pods</div>
            <div class="top">
                <div class="left">Used</div>
                <div class="percent">
                    <span>{podIntro.cpu.podCount}</span>
                    <span>/</span>
                    <span>{podIntro.cpu.podTotal}</span>
                    <span>{podIntro.cpu.podPercent}%</span>
                </div>
            </div>
            <div class="bar">
                <div class="bar-in" style="width:{podIntro.cpu.podPercent}%"></div>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
  .stat {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
    margin-bottom: 50px;
    padding-top: 20px;

    .stat-item {
      .label {
        line-height: 30px;
        font-size: 20px;
        margin-bottom: 20px;
      }

      .top {
        display: flex;

        .left {
          flex: 1;
        }

        .percent {
          span:last-child {
            margin-left: 10px;
          }
        }
      }

      .bar {
        height: 15px;
        position: relative;
        border-radius: 10px;
        background-color: $surfaceContainerHighest;
        overflow: hidden;
        margin-top: 10px;

        .bar-in {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background-color: $info;
        }
      }
    }
  }

  .pressure {
    padding-top: 30px;

    .pressure-item {
      line-height: 30px;
      background-color: $successColorContainer;
      color: $successOnColorContainer;
      display: inline-block;
      border-radius: 20px;
      border: 1px solid $successColor;
      padding-right: 15px;
      margin-right: 10px;

      .icon {
        width: 30px;
        text-align: center;
        display: inline-block;
      }

      .name {
        display: inline-block;
      }

      &.error {
        background-color: $errorContainer;
        color: $onErrorContainer;
      }
    }
  }
</style>