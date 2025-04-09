<script>
    import CodeIcon from "components/icons/CodeIcon.svelte";
    import yamlLib from 'js-yaml';
    import {setContext} from "svelte";
    import {Utils} from "lib";
    import YamlEditor from "components/YamlEditor.svelte";
    import ArrowRightIcon from "components/icons/ArrowRightIcon.svelte";
    import YamlIcon from "components/icons/YamlIcon.svelte";
    import SaveIcon from "components/icons/SaveIcon.svelte";
    import FormIcon from "components/icons/FormIcon.svelte";
    import CrossIcon from "components/icons/CrossIcon.svelte";

    let {
        content,
        kind,
        kindDefinition,
        disabled,
        type,
        editable = false,
        onBack,
        onExit,
        onSave,
        saveBtnName = 'Save',
        errorMsg = '',
        scene = 'create'
    } = $props();
    const datas = $state({
        content: {}
    });
    let activeNode = $state(null);
    let Component = $state(null);
    let componentOptions = $state({});
    let showEditor = $state(false);
    let editor = null;

    setContext("yaml", datas.content);
    setContext("scene", scene);

    function activeItem(node) {
        activeNode = node;
    }

    function getValue(data, node) {
        let path = node.key;
        let paths = splitPath(path);
        let parent = data;
        for (let path of paths) {
            if (parent && parent[path] !== undefined) {
                parent = parent[path];
            } else {
                return node.defaultValue ? node.defaultValue() : null;
            }
        }
        return parent;
    }

    function getNamespace() {
        let path = "metadata.namespace";
        let paths = splitPath(path);
        let parent = datas.content;
        for (let path of paths) {
            if (parent && parent[path] !== undefined) {
                parent = parent[path];
            } else {
                return null;
            }
        }
        return parent;
    }

    function setValue(data, path, value) {
        let paths = splitPath(path);
        let parent = data;
        for (let i = 0; i < paths.length; i++) {
            let path = paths[i];
            if (i === paths.length - 1) {
                parent[path] = value;
            } else {
                if (parent[path] === undefined) {
                    parent[path] = {};
                }
                parent = parent[path];
            }
        }
    }

    function editByYaml() {
        showEditor = true;
    }

    function editByForm() {
        if (editor) {
            datas.content = yamlLib.load(editor.getContent());
        }
        showEditor = false;
    }

    function splitPath(str) {
        const result = [];
        let current = '';
        let quoteType = null;
        for (const char of str) {
            if (quoteType) {
                if (
                    (quoteType === 'single' && char === "'") ||
                    (quoteType === 'double' && char === '"')
                ) {
                    quoteType = null;
                } else {
                    current += char;
                }
            } else {
                if (char === '.') {
                    result.push(current);
                    current = '';
                } else if (char === "'" || char === '"') {
                    quoteType = char === "'" ? 'single' : 'double';
                } else {
                    current += char;
                }
            }
        }
        if (current !== '') {
            result.push(current);
        }
        return result;
    }

    function toSave() {
        onSave && onSave({
            content: yamlLib.dump(datas.content),
            namespace: getNamespace()
        });
    }

    $effect(() => {
        datas.content = yamlLib.load(content);
    });
    $effect(() => {
        if (!activeNode && kindDefinition.length > 0) {
            activeNode = kindDefinition[0];
        }
    });
    $effect(() => {
        if (activeNode) {
            Component = activeNode.component;
            componentOptions = {
                key: activeNode.key,
                option: activeNode.option,
                value: getValue(datas.content, activeNode)
            };
        }
    });
    $effect(() => {
        if (activeNode) {
            setValue(datas.content, componentOptions.key, componentOptions.value);
        }
    });
</script>
{#snippet treeNode(node, padding = 15)}
    {#if node.children && node.children.length > 0}
        <div class="node-name has-children">
            <div class="node-name-padding" style="width: {padding}px"></div>
            <div class="node-name-title">{node.name}</div>
        </div>
    {:else}
        <button class={["dived node-name",activeNode&&node.key===activeNode.key&&"active"]}
                onclick={()=>activeItem(node)}>
            <div class="node-name-padding" style="width: {padding}px"></div>
            <div class="node-name-title">{node.name}</div>
            <div class="node-name-check">{Utils.typeToString(getValue(datas.content, node))}</div>
        </button>
    {/if}
    {#if node.children && node.children.length > 0}
        <div class="node-children">
            {#each node.children as child}
                {@render treeNode(child, padding + 15)}
            {/each}
        </div>
    {/if}
{/snippet}
<div class="yaml-form">
    <div class="yaml-form-left">
        <div class="yaml-form-header">
            {#if type && !editable}
                <div class="yaml-form-header-back" onclick={onBack}>
                    <ArrowRightIcon/>
                </div>
            {/if}
            <div class="yaml-form-header-desc">{kind}</div>
            {#if type}
                <div class="yaml-form-header-type">{type}</div>
            {/if}
        </div>
        <div class="tree">
            {#each kindDefinition as node}
                {@render treeNode(node)}
            {/each}
        </div>
    </div>
    <div class={["yaml-form-right",disabled&&'disabled']}>
        <div class="yaml-form-right-header">
            <div class="yaml-form-header-icon">
                <CodeIcon/>
            </div>
            <span>{activeNode ? activeNode.key : ''}</span>
        </div>
        <div class="yaml-form-right-body">
            {#if activeNode}
                {#if Component}
                    <Component option={componentOptions.option} bind:value={componentOptions.value}
                               disabled={disabled}/>
                {/if}
            {/if}
        </div>
        {#if errorMsg}
            <div class="yaml-form-right-error">{errorMsg}</div>
        {/if}
        <div class="yaml-form-right-btns">
            <div class="btn-group">
                <div class="btn" onclick={onExit}>
                    <CrossIcon/>
                    Cancel
                </div>
                <div class="btn" onclick={()=>editByYaml()}>
                    <YamlIcon/>
                    Edit as yaml
                </div>
                <div class="btn" onclick={()=>toSave()}>
                    <SaveIcon/>
                    {saveBtnName}
                </div>
            </div>
        </div>
    </div>
    {#if showEditor}
        <div class={["editor",disabled&&'disabled']}>
            <div class="editor-body">
                <YamlEditor bind:this={editor} content={datas.content}/>
            </div>
            {#if errorMsg}
                <div class="editor-body-error">{errorMsg}</div>
            {/if}
            <div class="editor-btns">
                <div class="btn-group">
                    <div class="btn" onclick={onExit}>
                        <CrossIcon/>
                        Cancel
                    </div>
                    <div class="btn" onclick={()=>editByForm()}>
                        <FormIcon/>
                        Edit as Form
                    </div>
                    <div class="btn" onclick={()=>toSave()}>
                        <SaveIcon/>
                        {saveBtnName}
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
  .tree {
    overflow: auto;
    padding: 0 0 50px 0;
    position: relative;

    .node-name {
      line-height: 35px;
      display: flex;
      width: 100%;
      box-sizing: border-box;
      position: relative;

      .node-name-title {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .node-name-check {
        color: $success;
        max-width: 50px;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding: 0 10px 0 10px;
        overflow: hidden;
      }

      &.has-children {
        color: $outline;
      }

      &.active {
        background-color: $primaryContainer;
        color: $onPrimaryContainer;

        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          background: $infoColor
        }
      }
    }
  }

  .yaml-form {
    display: flex;
    margin-top: 20px;
    @include elevation(3);
  }

  .yaml-form-left {
    width: 320px;
    background-color: $surfaceContainerLowest;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;

    .yaml-form-header {
      line-height: 50px;
      font-size: 16px;
      padding: 0 20px 0 15px;
      //border-bottom: 1px solid $surfaceContainerLow;
      display: flex;

      .yaml-form-header-back {
        width: 30px;
        transform: rotate(-180deg);
        text-align: right;
      }

      .yaml-form-header-desc {
      }

      .yaml-form-header-type {
        flex: 1;
        color: $outline;
        padding-left: 10px;
        font-size: 13px;
      }
    }

    .tree {
      flex: 1;
    }
  }

  .yaml-form-right {
    display: flex;
    flex-direction: column;
    flex: 1;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 320px;

    .yaml-form-right-header {
      line-height: 50px;
      padding: 0 20px 0 20px;
      font-size: 18px;
      display: flex;
    }

    .yaml-form-right-error {
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

    .yaml-form-right-body {
      padding: 0 20px 20px 20px;
      flex: 1;
      overflow: auto;
    }

    .yaml-form-right-btns {
      padding: 10px;
      text-align: right;
      background-color: $surfaceContainerLow;
    }

    &.disabled {
      .yaml-form-right-body {
        bottom: 0;
      }

      .yaml-form-right-btns {
        display: none;
      }
    }
  }

  .yaml-form-header-icon {
    width: 30px;
  }

  .yaml-form {
    flex: 1;
    //height: 800px;
    background-color: $surfaceContainer;
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
  }

  .buttons {
    padding: 20px 0 20px 0;
    text-align: right;
  }

  .editor {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    background-color: $surfaceContainer;
    display: flex;
    flex-direction: column;

    .editor-body {
      overflow: auto;
      flex: 1;
    }

    .editor-body-error {
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

    .editor-btns {
      padding: 10px;
      text-align: right;
      background-color: $surfaceContainerLow;
    }

    &.disabled {
      .editor-body {
        bottom: 0;
      }

      .editor-btns {
        display: none;
      }
    }
  }

  :global(body[data-theme="light"]) {
    .yaml-form {
      background-color: $surfaceContainerLow;
    }
  }
</style>