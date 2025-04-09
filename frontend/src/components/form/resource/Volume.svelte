<script>
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import DropMenu from "components/DropMenu.svelte";
    import VolumeNfs from "components/form/resource/VolumeNFS.svelte";
    import VolumeConfigmap from "components/form/resource/VolumeConfigmap.svelte";
    import VolumePvc from "components/form/resource/VolumePVC.svelte";
    import VolumeSecret from "components/form/resource/VolumeSecret.svelte";
    import VolumeHost from "components/form/resource/VolumeHost.svelte";
    import VolumeEmptyDir from "components/form/resource/VolumeEmptyDir.svelte";

    let {value = $bindable(), callback, disabled} = $props();

    let items = $state([]);

    let types = [
        {
            label: 'NFS',
            value: 'nfs',
            component: VolumeNfs,
            defaultValue() {
                return {
                    name: '',
                    nfs: {
                        server: '',
                        path: '',
                        readOnly: false
                    }
                };
            },
            action: () => add('nfs')
        },
        {
            label: 'Configmap',
            value: 'configmap',
            component: VolumeConfigmap,
            defaultValue() {
                return {
                    name: '',
                    configMap: {
                        name: '',
                        items: [],
                        defaultMode: '0644',
                        optional: false
                    }
                };
            },
            action: () => add('configmap')
        },
        {
            label: 'Secret',
            value: 'secret',
            defaultValue() {
                return {
                    name: "",
                    secret: {
                        secretName: '',
                        items: [],
                        defaultMode: '0644',
                        optional: false
                    }
                }
            },
            component: VolumeSecret,
            action: () => add('secret')
        },
        {
            label: 'HostPath',
            value: 'hostPath',
            defaultValue() {
                return {
                    name: '',
                    hostPath: {
                        path: '',
                        type: ''
                    }
                }
            },
            component: VolumeHost,
            action: () => add('hostPath')
        },
        {
            label: 'EmptyDir',
            value: 'emptyDir',
            defaultValue() {
                return {
                    name: '',
                    emptyDir: {
                        medium: '',
                        sizeLimit: ''
                    }
                }
            },
            component: VolumeEmptyDir,
            action: () => add('emptyDir')
        },
        {
            label: 'Persistent Volume Claim',
            value: 'pvc', component: VolumePvc,
            defaultValue() {
                return {
                    name: "",
                    persistentVolumeClaim: {
                        claimName: '',
                        readOnly: false
                    }
                }
            },
            action: () => add('pvc')
        }
    ]

    function add(type) {
        let t = types.find(a => a.value === type);
        items.push({
            id: Math.random(),
            component: t.component,
            options: t.defaultValue()
        });
    }

    function remove(item) {
        items = items.filter(a => a.id !== item.id);
        update();
    }

    $effect(() => {
        if (value) {
            items = value.map(a => {
                let r = {
                    id: Math.random(),
                    name: a.name,
                    options: a
                };
                if (a.configMap) {
                    r.type = 'configmap';
                    r.component = VolumeConfigmap;
                } else if (a.secret) {
                    r.type = 'secret';
                    r.component = VolumeSecret;
                } else if (a.persistentVolumeClaim) {
                    r.type = 'pvc';
                    r.component = VolumePvc;
                } else if (a.hostPath) {
                    r.type = 'hostPath';
                    r.component = VolumeHost;
                } else if (a.emptyDir) {
                    r.type = 'emptyDir';
                    r.component = VolumeEmptyDir;
                } else if (a.nfs) {
                    r.type = 'nfs';
                    r.component = VolumeNfs;
                } else {
                    return null;
                }
                return r;
            }).filter(a => !!a);
        }
    });

    function update() {
        let list = items.map(a => {
            return JSON.parse(JSON.stringify(a.options));
        }).filter(a => !!a);
        // callback && callback(list);
        value = list;
    }

</script>
{#snippet btn()}
    <div style="pointer-events: none">Add Volume</div>
{/snippet}
<div class="panel">
    {#each items as item}
        <div class="content">
            <button class="dived remove" onclick={()=>remove(item)} disabled={disabled}>
                <CrossIcon/>
            </button>
            {#if item.component}
                {@const Component = item.component}
                <Component value={item.options} callback={a=>(item.options=a)&&update()} disabled={disabled}/>
            {/if}
        </div>
    {/each}
    <div class="buttons">
        <DropMenu menus={types} btn={btn} disabled={disabled}/>
    </div>
</div>

<style lang="scss">
  .panel {
    .content {
      background-color: $surfaceContainerHigh;
      padding: 0 20px 5px 20px;
      border-radius: 5px;
      @include elevation(2);
      position: relative;
      margin-bottom: 20px;

      .remove {
        position: absolute;
        top: 0;
        right: 0;
        width: 40px;
        line-height: 40px;
        text-align: center;
      }
    }
  }
</style>