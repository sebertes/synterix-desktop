<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";
    import {Utils} from "lib";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value, callback, disabled} = $props();
    let envList = $state([]);
    let configMapList = $state([]);
    let secretList = $state([]);

    let types = [
        {name: 'KeyValue', value: 'keyValue'},
        {name: 'ConfigMap', value: 'configMapKeyRef'},
        {name: 'SecretKey', value: 'secretKeyRef'},
        {name: 'Field', value: 'fieldRef'},
        {name: 'ResourceField', value: 'resourceFieldRef'},
    ]

    function add() {
        envList.push({
            name: '',
            value: {
                left: '',
                right: ''
            },
            type: 'keyValue',
            id: Utils.getRandomId()
        });
    }

    function remove(env) {
        envList = envList.filter(a => a.id !== env.id);
        update();
    }

    function update() {
        let t = envList.map(({name, value, type}) => {
            let r = {name};
            if (type === 'keyValue') {
                r.value = value.left;
            } else if (type === 'configMapKeyRef' || type === 'secretKeyRef') {
                r.valueFrom = {
                    [type]: {
                        name: value.left,
                        key: value.right
                    }
                }
            } else if (type === 'fieldRef') {
                r.valueFrom = {
                    fieldRef: {
                        fieldPath: value.left
                    }
                }
            } else if (type === 'resourceFieldRef') {
                r.valueFrom = {
                    resourceFieldRef: {
                        containerName: value.left,
                        resource: value.right
                    }
                }
            }
            return r;
        });
        callback && callback(t);
    }

    function getConfigmapSubList(value) {
        let t = (configMapList || []).find(a => a.name === value);
        if (t) {
            return Reflect.ownKeys(t.data || {}).map(a => {
                return {name: a, value: a};
            });
        }
        return [];
    }

    function getSecretSubList(value) {
        let t = (secretList || []).find(a => a.name === value);
        if (t) {
            return Reflect.ownKeys(t.data || {}).map(a => {
                return {name: a, value: a};
            });
        }
        return [];
    }

    $effect(() => {
        envList = (value || []).map(a => {
            let r = {
                name: a.name,
                value: {
                    left: a.value,
                    right: ''
                },
                type: 'keyValue',
                id: Utils.getRandomId()
            };
            if (a['valueFrom']) {
                if (a['valueFrom']['configMapKeyRef']) {
                    r.type = 'configMapKeyRef';
                    let m = a['valueFrom']['configMapKeyRef'];
                    r.value = {
                        left: m.name,
                        right: m.key
                    };
                } else if (a['valueFrom']['secretKeyRef']) {
                    r.type = 'secretKeyRef';
                    let m = a['valueFrom']['secretKeyRef'];
                    r.value = {
                        left: m.name,
                        right: m.key
                    }
                } else if (a['valueFrom']['fieldRef']) {
                    r.type = 'fieldRef';
                    let m = a['valueFrom']['fieldRef'];
                    r.value = {
                        left: m.fieldPath
                    }
                } else if (a['valueFrom']['resourceFieldRef']) {
                    r.type = 'resourceFieldRef';
                    let m = a['valueFrom']['resourceFieldRef'];
                    r.value = {
                        left: m.containerName,
                        right: m.resource
                    }
                }
            }
            return r;
        });
    });
    $effect(() => {
        ResourcesUtils.ready("ConfigMap", resource => {
            configMapList = resource.getAllRawList().map(a => {
                return {
                    name: a.metadata.name,
                    value: a.metadata.name,
                    data: a.data
                };
            });
        })
    });
    $effect(() => {
        ResourcesUtils.ready("Secret", resource => {
            secretList = resource.getAllRawList().map(a => {
                return {
                    name: a.metadata.name,
                    value: a.metadata.name,
                    data: a.data
                };
            });
        });
    })
</script>

<div class="section">
    <div class="title">Environment Variables</div>
    {#each envList as env}
        <div class="block env-grid">
            <div class="field">
                <Select label="Type" bind:value={env.type} options={types} disabled={disabled}/>
            </div>
            <div class="field">
                <Input label="Variable Name" bind:value={env.name} disabled={disabled}/>
            </div>
            {#if env.type === 'configMapKeyRef'}
                <div class="block env-grid2">
                    <div class="field">
                        <Select label="Name" bind:value={env.value.left} options={configMapList}
                                onClose={()=>update()} disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Select label="Key" bind:value={env.value.right} options={getConfigmapSubList(env.value.left)}
                                onClose={()=>update()} disabled={disabled}/>
                    </div>
                </div>
            {:else if env.type === 'secretKeyRef'}
                <div class="block env-grid2">
                    <div class="field">
                        <Select label="Name" bind:value={env.value.left} options={secretList} onClose={()=>update()}
                                disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Select label="Key" bind:value={env.value.right} options={getSecretSubList(env.value.left)}
                                onClose={()=>update()} disabled={disabled}/>
                    </div>
                </div>
            {:else if env.type === 'fieldRef'}
                <div class="field">
                    <Input label="Key" bind:value={env.value.left} onblur={()=>update()} disabled={disabled}/>
                </div>
            {:else if env.type === 'resourceFieldRef'}
                <div class="block env-grid2">
                    <div class="field">
                        <Input label="Container Name" bind:value={env.value.left} onblur={()=>update()}
                               disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Input label="Resource" bind:value={env.value.right} onblur={()=>update()} disabled={disabled}/>
                    </div>
                </div>
            {:else}
                <div class="field">
                    <Input label="Variable Value" bind:value={env.value.left} onblur={()=>update()}
                           disabled={disabled}/>
                </div>
            {/if}
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" onclick={()=>remove(env)} disabled={disabled}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add Variables</button>
    </div>
</div>

<style lang="scss">
  .env-grid {
    grid-template-columns: 1fr 1fr 2fr 80px;
  }

  .env-grid2 {
    grid-template-columns: 1fr 1fr;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>