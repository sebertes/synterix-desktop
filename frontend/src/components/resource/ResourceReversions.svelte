<script>
    import Select from "components/form/Select.svelte";
    import {html} from 'diff2html';
    import yamlLib from "js-yaml";
    import {createTwoFilesPatch} from 'diff';
    import 'lib/diff.css';
    import {popupProvider} from "store/Common.svelte.js";
    import UnifiedIcon from "components/icons/UnifiedIcon.svelte";
    import SplitIcon from "components/icons/SplitIcon.svelte";
    import RollbackIcon from "components/icons/RollbackIcon.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import {KubeUtils} from "store/KubeUtils.svelte.js";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {selector, annotations, popupId, onRollback} = $props();
    let replicaSets = $state([]);
    let current = $state(null);
    let selected = $state(null);
    let selectedReversion = $state(null);
    let diffStr = $state(null);
    let mode = $state('line-by-line');

    function rollback() {
        if (selectedReversion) {
            let reversion = selectedReversion.metadata.annotations['deployment.kubernetes.io/revision'];
            onRollback && onRollback(reversion);
            popupProvider.close(popupId);
        }
    }

    $effect(() => {
        ResourcesUtils.ready("ReplicaSet", resource => {
            let list = resource.getRawBySelector(selector);
            let currentReversion = list.find(a => {
                let t = annotations['deployment.kubernetes.io/revision'];
                return t === a.metadata.annotations['deployment.kubernetes.io/revision'];
            });
            replicaSets = list.filter(a => a !== currentReversion).map(a => {
                let reversion = a.metadata.annotations['deployment.kubernetes.io/revision'];
                return {
                    name: `Reversion ${reversion || 0} ${KubeUtils.formatAge(a.metadata.creationTimestamp)}`,
                    value: a.metadata.name,
                    data: a
                }
            });
            current = currentReversion;
        })
    });
    $effect(() => {
        if (!selectedReversion && replicaSets.length > 0) {
            selected = replicaSets[0].value;
        }
    });
    $effect(() => {
        let t = replicaSets.find(a => a.value === selected);
        if (t) {
            selectedReversion = t.data;
        }
    });
    $effect(() => {
        if (selectedReversion) {
            const unifiedDiff = createTwoFilesPatch(
                'original.yaml',
                'modified.yaml',
                yamlLib.dump(current),
                yamlLib.dump(selectedReversion),
                'Original',
                'Modified'
            );
            diffStr = html(unifiedDiff, {
                outputFormat: mode,
                highlight: true,
                matching: 'words'
            });
        }
    });
</script>

<div class="differ">
    <div class="differ-top">
        <Select options={replicaSets} label="Select Reversion" bind:value={selected}/>
    </div>
    <div class="differ-body">{@html diffStr}</div>
    <div class="differ-btns">
        <div class="differ-btns-left btn-group">
            <button class={["btn btn-primary",mode==='line-by-line'&&'hover']} onclick={() => mode='line-by-line'}>
                <UnifiedIcon/>
                Unified
            </button>
            <button class={["btn btn-primary",mode==='side-by-side'&&'hover']} onclick={() => mode='side-by-side'}>
                <SplitIcon/>
                Split
            </button>
        </div>
        <div class="differ-btns-right btn-group">
            <button class="btn btn-primary" onclick={()=>popupProvider.close(popupId)}>
                <CrossIcon/>
                Cancel
            </button>
            <button class="btn btn-primary" onclick={() => rollback()}>
                <RollbackIcon/>
                Rollback
            </button>
        </div>
    </div>
</div>

<style lang="scss">
  .differ {
    position: absolute;
    top: 60px;
    left: 10px;
    right: 10px;
    bottom: 10px;

    .differ-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }

    .differ-body {
      position: absolute;
      top: 70px;
      bottom: 70px;
      left: 0;
      right: 0;
      overflow: auto;
      border: 1px solid $outlineVariant;
    }

    .differ-btns {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 10px 0 10px 0;
      display: flex;

      .differ-btns-left {
        flex: 1;
      }
    }
  }
</style>