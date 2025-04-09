<script>
    let {deployment} = $props();

    let podsStatusStatistics = $derived.by(() => {
        return deployment.getPodsStatusStatistics();
    });

</script>

{#if podsStatusStatistics && podsStatusStatistics.length > 0}
    <div class="workload-bottom">
        <div class="workload-bottom-title">Pods by State</div>
        <div class="pods">
            {#each podsStatusStatistics as pod}
                <div class={['pod',pod.className]}>
                    {#if pod.percent !== 100}
                        <div class="circle">
                            <div class="proportional-circle" style="--percent: {pod.percent}; --thickness: 2px"></div>
                        </div>
                    {/if}
                    <div class="numbers">
                        <div class="size">{pod.size}</div>
                        <div class="dot">{pod.state}</div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}

<style lang="scss">
  .pod {
    display: flex;

    .circle {
      padding: 0 10px 0 10px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>