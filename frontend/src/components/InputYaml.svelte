<script>
    import YamlEditor from "components/YamlEditor.svelte";
    import {eventBus, popupProvider} from "store/Common.svelte.js";
    import ResourceList from "components/resource/ResourceList.svelte";
    import {KubeService} from "store/KubeService.svelte.js";
    import FileIcon from "components/icons/FileIcon.svelte";
    import CheckIcon from "components/icons/CheckIcon.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {popupId} = $props();
    let data = $state([]);
    let yamlContent = $state(null);
    let input;
    let editor;
    let select;

    function openFile() {
        input.click();
    }

    function onOpenFile(e) {
        let file = e.target.files[0];
        if (!file) {
            console.log('未选择文件');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            yamlContent = e.target.result;
        };
        reader.onerror = (e) => {
            console.error('文件读取失败:', e);
        };
        reader.readAsText(file, 'UTF-8');
    }

    async function submit() {
        let {data} = await KubeService.importResource.post({
            namespace: select.value,
            content: editor.getContent(),
        });
        (data || []).forEach(a => eventBus.emit("resourceUpdate", a));

        popupProvider.close(popupId);
        setTimeout(() => {
            popupProvider.open("Applied Resource", ResourceList, {
                resources: (data || []).map(a => a.target)
            });
        });
    }

    $effect(() => {
        ResourcesUtils.ready("Namespace", namespace => {
            let a = namespace.getAllRawList();
            data = a.map(a => (
                {
                    name: a.metadata.name,
                    value: a.metadata.name,
                }
            ))
        })
    })
</script>

<div class="content">
    <div class="top">
        <div class="left">
            <button class="btn" onclick={openFile}>
                <FileIcon/>
                Input form file
            </button>
            <input type="file" class="hidden" bind:this={input} onchange={onOpenFile} accept=".yaml,.yml"/>
        </div>
        <div class="rights">
            <span class="select-label">Select Namespace</span>
            <select bind:this={select}>
                {#each data as item}
                    <option value={item.value}>{item.name}</option>
                {/each}
            </select>
        </div>
    </div>
    <div class="body">
        <YamlEditor content={yamlContent} bind:this={editor}/>
    </div>
    <div class="bottom">
        <div class="btn-group">
            <button class="btn" onclick={()=>popupProvider.close(popupId)}>
                <CrossIcon/>
                Cancel
            </button>
            <button class="btn" onclick={()=>submit()}>
                <CheckIcon/>
                Import
            </button>
        </div>
    </div>
</div>

<style lang="scss">
  .content {
    margin: -10px;
  }

  .top {
    display: flex;
    padding: 10px;
    border-top: 1px solid $outlineVariant;
    border-bottom: 1px solid $outlineVariant;
    background: $surfaceContainerHigh;

    .left {
      flex: 1;
    }
  }

  .select-label {
    line-height: 40px;
    padding-right: 10px;
  }

  .hidden {
    display: none;
  }

  .body {
    height: 400px;
    overflow: auto;
    position: relative;
  }

  .bottom {
    padding: 10px;
    text-align: right;
    border-top: 1px solid $outlineVariant;
  }
</style>