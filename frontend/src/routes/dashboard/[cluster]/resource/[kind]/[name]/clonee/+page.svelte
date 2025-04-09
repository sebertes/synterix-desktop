<script>
    import 'lib/diff.css';
    import YamlEditor from "components/YamlEditor.svelte";
    import {createTwoFilesPatch} from "diff";
    import {html} from "diff2html";
    import {goto} from "$app/navigation";
    import SaveIcon from "components/icons/SaveIcon.svelte";
    import SeeIcon from "components/icons/SeeIcon.svelte";
    import HideIcon from "components/icons/HideIcon.svelte";
    import UnifiedIcon from "components/icons/UnifiedIcon.svelte";
    import SplitIcon from "components/icons/SplitIcon.svelte";
    import FileIcon from "components/icons/FileIcon.svelte";
    import yamlLib from "js-yaml";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {data} = $props();
    let content = $state({});

    let showDiff = $state(false);
    let editorContent = $state(null);

    let diffStr = $state(null);
    let mode = $state('line-by-line');
    let errorMsg = $state("");
    let handler = $state(null);

    let editor = null;
    let file = null;

    function showDiffPanel() {
        if (editor) {
            editorContent = editor.getContent();
            showDiff = true;
        }
    }

    function hideDiffPanel() {
        showDiff = false;
    }

    function getFileContent(e) {
        let file = e.target.files[0];
        if (!file) {
            console.log('未选择文件');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            editorContent = e.target.result;
        };
        reader.onerror = (e) => {
            console.error('文件读取失败:', e);
        };
        reader.readAsText(file);
    }

    function cancel() {
        let {list} = handler.getLinks(data.name);
        goto(list);
    }

    async function save() {
        let content = editor.getContent();
        let q = yamlLib.load(content);
        let {code, msg} = await handler.getHandler().create({
            content,
            namespace: q.metadata.namespace
        });
        if (code !== 0) {
            editorContent = msg;
        }
    }

    $effect(() => {
        ResourcesUtils.ready(data.kind, r => {
            let e = r.getByName(data.name)?.raw;
            if (!e) {
                r.getHandler().gotoList();
                return;
            }
            let t = yamlLib.dump(e);
            handler = r.getHandler();
            content = t;
            editorContent = t;
        })
    });
    $effect(() => {
        if (showDiff) {
            const unifiedDiff = createTwoFilesPatch(
                'original.yaml',
                'modified.yaml',
                content,
                editorContent,
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
<div class="content">
    {#if !showDiff}
        <div class="body">
            <YamlEditor content={editorContent} bind:this={editor}/>
        </div>
    {:else}
        <div class="differ-body">{@html diffStr}</div>
    {/if}
    {#if errorMsg}
        <div class="error-msg">{errorMsg}</div>
    {/if}
    <div class="foot-btns">
        <div class="foot-btns-left">
            {#if showDiff}
                <div class="btn-group">
                    <button class={["btn btn-primary",mode==='line-by-line'&&'hover']}
                            onclick={() => mode='line-by-line'}>
                        <UnifiedIcon/>
                        Unified
                    </button>
                    <button class={["btn btn-primary",mode==='side-by-side'&&'hover']}
                            onclick={() => mode='side-by-side'}>
                        <SplitIcon/>
                        Split
                    </button>
                </div>
            {:else}
                <div class="btn-group">
                    <input type="file" onchange={e=>getFileContent(e)} style="display: none" bind:this={file}/>
                    <button class="btn btn-primary" onclick={()=>file&&file.click()}>
                        <FileIcon/>
                        Read from file
                    </button>
                </div>
            {/if}
        </div>
        <div class="foot-btns-right">
            <div class="btn-group">
                {#if !showDiff}
                    <button class="btn btn-primary" onclick={()=>showDiffPanel()}>
                        <SeeIcon/>
                        Diff
                    </button>
                {:else}
                    <button class="btn btn-primary" onclick={()=>hideDiffPanel()}>
                        <HideIcon/>
                        Diff
                    </button>
                {/if}
            </div>
            <div class="btn-group">
                <button class="btn btn-primary" onclick={cancel}>
                    <CrossIcon/>
                    Cancel
                </button>
                <button class="btn btn-primary" onclick={save}>
                    <SaveIcon/>
                    Save
                </button>
            </div>
        </div>
    </div>
</div>


<style lang="scss">
  .content {
    position: absolute;
    top: 100px;
    left: 10px;
    right: 10px;
    bottom: 0;
    display: flex;
    flex-direction: column;

    .body,
    .differ-body {
      overflow: auto;
      border-top: 1px solid $outlineVariant;
      flex: 1;
    }

    .error-msg {
      padding: 10px 10px 10px 15px;
      background-color: $errorContainer;
      color: $onErrorContainer;
      position: relative;

      &:before {
        content: '';
        position: absolute;
        right: 100%;
        top: 0;
        bottom: 0;
        width: 5px;
        background-color: $error;
        transform: translateX(5px);
      }
    }

    .foot-btns {
      padding: 10px 0 10px 0;
      display: flex;
      border-top: 1px solid $outlineVariant;

      .foot-btns-left {
        flex: 1;
      }
    }
  }
</style>