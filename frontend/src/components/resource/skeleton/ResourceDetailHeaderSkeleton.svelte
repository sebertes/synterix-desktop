<script>
    import DropMenu from "components/DropMenu.svelte";
    import RefreshIcon from "components/icons/RefreshIcon.svelte";
    import CopyIcon from "components/icons/CopyIcon.svelte";
    import Table from "components/Table.svelte";
    import Tab from "components/Tab.svelte";
    import LoadingIcon from "components/icons/LoadingIcon.svelte";
    import {cluster} from "store/Cluster.svelte.js";
    import YamlForm from "components/form/YamlForm.svelte";
    import YamlEditor from "components/YamlEditor.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {action, kind} = $props();
    let yamlContent = `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  labels:
    app: my-application
    environment: production
data:
  key: xx`;
    let yamlEditorContent = `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  labels:
    app: my-application
    environment: production
data:
  key: xx` + '\n'.repeat(30);
    let resource = {
        kind: 'Pod',
        metadata: {
            name: getRandomStr(),
            namespace: getRandomStr(),
            labels: {
                xxx: getRandomStr(),
                xxx2: getRandomStr(),
                xxx3: getRandomStr(),
                xxx4: getRandomStr()
            },
            annotations: {
                xxx: getRandomStr(),
                xxx2: getRandomStr(),
                xxx3: getRandomStr(),
                xxx4: getRandomStr()
            }
        },
        status: {
            phase: 'Running'
        }
    };
    let resourceIntro = {
        status: {
            className: 'status-active',
            status: 'Running',
        },
        age: "180days"
    }
    let links = $state([]);
    let dropMenus = [
        {
            id: "redeploy", label: "Redeploy", icon: RefreshIcon
        }
    ];
    let tabs = [
        {
            id: "conditions",
            title: "Conditions",
            component: Table,
            params: {
                header: [
                    {name: "Condition", key: "type", align: "left"},
                    {name: "Status", key: "status", align: "left"},
                    {name: "Updated", key: "lastUpdateTime", align: "left"},
                    {name: "Message", key: "message", align: "left"}
                ],
                buttons: [],
                menus: [],
                checkbox: false,
                data: [{
                    type: getRandomStr(),
                    status: getRandomStr(),
                    lastUpdateTime: getRandomStr(),
                    message: getRandomStr()
                }]
            }
        },
        {
            id: "refers",
            title: "Related Resources"
        }
    ];
    let images = Array.from(new Array(3)).fill(0).map(a => {
        return {key: getRandomStr(), value: getRandomStr()}
    });

    function getRandomStr() {
        let aa = 'abcdefghizklmnopqrstuvwxyz';
        return Array.from(new Array(5 + Math.round(Math.random() * 20))).fill(0).map(a => {
            return aa[Math.round(Math.random() * 26)];
        }).join("");
    }

    let kindDefinition = $state([]);
    let ready = $state(false);
    $effect(async () => {
        let t = await ResourcesUtils.getKindHandler(kind);
        kindDefinition = t.getFormDefinition();
        let m = t.getActionPages();
        if (m.length > 0) {
            m[0].active = true;
        }
        links = m;
        ready = true;
    });
</script>
<div class="workload-content">
    <div class="workload-detail-top">
        <div class="workload-detail-top-in">
            <div class="workload-detail-left">
                <div class="workload-detail-title relative">
                    <a href="/dashboard/{cluster.path}/resources/{resource.kind.toLowerCase()}s">{resource.kind}s</a>
                    <span>{resource ? resource.metadata.name : '--'}</span>
                    {#if resourceIntro && resourceIntro.status}
                        <span class={["status-text","large", resourceIntro.status.className||resourceIntro.status.class]}>{resourceIntro.status.status}</span>
                    {/if}
                </div>
                <div class="workload-detail-desc ">
                    {#if resource && resource.metadata.namespace}
                        <div class="intro relative">
                            <span class="key">Namespace:</span><span
                                class="value">{resource ? resource.metadata.namespace : '--'}</span>
                        </div>
                    {/if}
                    <div class="intro relative">
                        <span class="key">Aga:</span><span
                            class="value">{resourceIntro.age ? resourceIntro.age : '--'}</span>
                    </div>

                </div>

            </div>
            <div class="workload-detail-right relative">
                {#if ready}
                    <div class="btn-group">
                        {#each links as link}
                            <a href={link.href} class={['btn',link.active&&'hover']}>{link.name}</a>
                        {/each}
                    </div>
                {/if}
                <DropMenu menus={dropMenus}/>
            </div>
        </div>
    </div>
    <div class="workload-mid">
        <div class="intro">
            {#each images as image}
                <span class="key">{image.key}:</span><span class="value">{image.value}</span>
            {/each}
        </div>
        <div class="intro">
            <span class="key">Labels:</span>
            <div class="labels">
                {#each Object.entries(resource.metadata.labels) as [key, value]}
                    <div class="label">{key}:{value}</div>
                {/each}
            </div>
        </div>
        <div class="intro">
            <span class="key">Annotations:</span>
            <a href="#pods" class="value">Show annotation</a>
        </div>
        <div class={['annotations']}>
            {#each Object.entries(resource.metadata.annotations) as [key, value]}
                <div class="annotation">
                    <div class="aKey">{key}</div>
                    <div class="aValue">{value}</div>
                    <button class="dived copy" onclick={()=>copy(value)}>
                        <CopyIcon/>
                        Copy
                    </button>
                </div>
            {/each}
        </div>
    </div>
    {#if ready}
        {#if ['edit', 'config', 'clone'].includes(action)}
            <div class="content">
                <YamlForm kind={kind} content={yamlContent}
                          disabled={true}
                          kindDefinition={kindDefinition}/>
            </div>
        {:else if ['yaml', 'yamle'].includes(action) || links.length === 0}
            <div class="yaml-content">
                <YamlEditor content={yamlEditorContent} disabled={true}/>
            </div>
        {:else}
            <div class="workload-tabs">
                <Tab tabs={tabs}/>
            </div>
        {/if}
    {/if}
</div>
<div class="mask"></div>
<div class="loading">
    <div class="spinner" style="margin-right: 5px">
        <LoadingIcon/>
    </div>
    <div>Loading...</div>
</div>

<style lang="scss">
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .loading {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .content {
    position: absolute;
    top: 90px;
    left: 10px;
    right: 10px;
    bottom: 10px;
  }

  .yaml-content {
    position: absolute;
    top: 100px;
    left: 10px;
    right: 10px;
    bottom: 0;
  }
</style>