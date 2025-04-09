<script>
    import NodePreferredDuringExecution from "components/form/resource/NodePreferredDuringExecution.svelte";
    import PodPreferredDuringExecution from "components/form/resource/PodPreferredDuringExecution.svelte";
    import NodeSelectorTerms from "components/form/resource/NodeSelectorTerms.svelte";
    import PodRequiredDuringExecution from "components/form/resource/PodRequiredDuringExecution.svelte";

    let {value = $bindable(), disabled} = $props();
    let affinity = $state({
        nodeAffinity: {
            requiredDuringSchedulingIgnoredDuringExecution: {
                nodeSelectorTerms: []
            },
            preferredDuringSchedulingIgnoredDuringExecution: []
        },
        podAffinity: {
            requiredDuringSchedulingIgnoredDuringExecution: [],
            preferredDuringSchedulingIgnoredDuringExecution: []
        }
    });

    $effect(() => {
        if (value) {
            affinity = {
                nodeAffinity: {
                    requiredDuringSchedulingIgnoredDuringExecution: {
                        nodeSelectorTerms: value.nodeAffinity?.requiredDuringSchedulingIgnoredDuringExecution?.nodeSelectorTerms || []
                    },
                    preferredDuringSchedulingIgnoredDuringExecution: value.nodeAffinity?.preferredDuringSchedulingIgnoredDuringExecution || []
                },
                podAffinity: {
                    requiredDuringSchedulingIgnoredDuringExecution: value.podAffinity?.requiredDuringSchedulingIgnoredDuringExecution || [],
                    preferredDuringSchedulingIgnoredDuringExecution: value.podAffinity?.preferredDuringSchedulingIgnoredDuringExecution || []
                }
            };
        }
    });

    function update() {
        let r = {
            nodeAffinity: {
                requiredDuringSchedulingIgnoredDuringExecution: {
                    nodeSelectorTerms: affinity.nodeAffinity?.requiredDuringSchedulingIgnoredDuringExecution?.nodeSelectorTerms || []
                },
                preferredDuringSchedulingIgnoredDuringExecution: affinity.nodeAffinity?.preferredDuringSchedulingIgnoredDuringExecution || []
            },
            podAffinity: {
                requiredDuringSchedulingIgnoredDuringExecution: affinity.podAffinity?.requiredDuringSchedulingIgnoredDuringExecution || [],
                preferredDuringSchedulingIgnoredDuringExecution: affinity.podAffinity?.preferredDuringSchedulingIgnoredDuringExecution || []
            }
        };
        value = r;
    }
</script>

<div class="section">
    <div class="title">NodeAffinity</div>
    <NodeSelectorTerms
            bind:value={affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms}
            disabled={disabled}/>
    <NodePreferredDuringExecution value={affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution}
                                  callback={value=>(affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution=value)&&update()}
                                  disabled={disabled}/>
    <div class="title">PodAffinity</div>
    <PodRequiredDuringExecution value={affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution}
                                callback={value=>(affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution=value)&&update()}
                                disabled={disabled}/>
    <PodPreferredDuringExecution value={affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution}
                                 callback={value=>(affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution=value)&&update()}
                                 disabled={disabled}/>
</div>

<style lang="scss">
  .panel {
    .content {
      background-color: $surfaceContainerHigh;
      padding: 30px 20px 10px 20px;
      border-radius: 5px;
      @include elevation(2);
      position: relative;
      margin-bottom: 20px;

      .item-remove {
        position: absolute;
        top: 0;
        right: 0;
        width: 30px;
        line-height: 30px;
        text-align: center;
      }
    }
  }
</style>