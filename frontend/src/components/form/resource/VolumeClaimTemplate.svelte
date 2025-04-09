<script>
    import Input from "components/form/Input.svelte";
    import KeyValue from "components/form/resource/KeyValue.svelte";
    import Selector from "components/form/resource/Selector.svelte";
    import Select from "components/form/Select.svelte";
    import MultipeSelect from "components/form/MultipeSelect.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value = $bindable({}), disabled} = $props();
    let list = $state([]);
    let props = $state({
        metadata: {
            name: '',
            labels: {},
            annotations: {}
        },
        spec: {
            selector: {
                matchLabels: {},
                matchExpressions: []
            },
            resources: {
                requests: {
                    storage: ''
                }
            },
            accessModes: ['ReadWriteOnce'],
            volumeMode: 'Filesystem',
            storageClassName: '',
        }
    });

    let accessModes = [
        {name: 'ReadWriteOnce', value: 'ReadWriteOnce'},
        {name: 'ReadOnlyMany', value: 'ReadOnlyMany'},
        {name: 'ReadWriteMany', value: 'ReadWriteMany'},
        {name: 'ReadWriteOncePod', value: 'ReadWriteOncePod'}
    ];

    $effect(() => {
        if (value) {
            props = {
                metadata: {
                    name: value.metadata.name,
                    labels: value.metadata.labels || {},
                    annotations: value.metadata.annotations || []
                },
                spec: {
                    resources: {
                        requests: {
                            storage: value.spec?.resources?.requests?.storage
                        }
                    },
                    accessModes: value.spec?.accessModes || ['ReadWriteOnce'],
                    volumeMode: value.spec?.volumeMode || 'Filesystem',
                    storageClassName: value.spec?.storageClassName,
                    selector: {
                        matchLabels: value.spec?.selector?.matchLabels || {},
                        matchExpressions: value.spec?.selector?.matchExpressions || []
                    }
                }
            };
        }
    });
    $effect(() => {
        ResourcesUtils.ready("StorageClass",resource=>{
            list = resource.getAllRawList().map(a => {
                return {name: a.metadata.name, value: a.metadata.name};
            });
        })
    });

    function update() {
        Object.assign(value, {
            metadata: {
                name: props.metadata.name,
                labels: props.metadata.labels,
                annotations: props.metadata.annotations
            },
            spec: {
                resources: {
                    requests: {
                        storage: props.spec.resources.requests.storage
                    }
                },
                accessModes: props.spec.accessModes,
                volumeMode: props.spec.volumeMode,
                storageClassName: props.spec.storageClassName,
                selector: {
                    matchLabels: props.spec.selector.matchLabels,
                    matchExpressions: props.spec.selector.matchExpressions
                }
            }
        });
    }
</script>

<div class="section">
    <div class="block colum-2">
        <div class="field">
            <Input label="Volume Claim Template Name" bind:value={props.metadata.name} disabled={disabled}
                   onblur={update}/>
        </div>
        <div class="field">
            <Select label="Storage CLass" options={list} bind:value={props.spec.storageClassName}
                    disabled={disabled} onClose={update}/>
        </div>
        <div class="field">
            <MultipeSelect label="Access Modes" options={accessModes} bind:value={props.spec.accessModes}
                           onClose={update}/>
        </div>
        <div class="field">
            <Input label="Volume Claim storage" type="number" bind:value={props.spec.resources.requests.storage}
                   disabled={disabled} unit="GiB" onblur={update}/>
        </div>
    </div>
    <div class="block colum-1">
        <KeyValue label={'Labels'} value={props.metadata.labels}
                  callback={v=>(props.metadata.labels=v)&&update()}
                  disabled={disabled}/>
    </div>
    <div class="block colum-1">
        <KeyValue label={'Annotations'} value={props.metadata.annotations}
                  callback={v=>(props.metadata.annotations=v)&&update()}
                  disabled={disabled}/>
    </div>
    <div class="block colum-1">
        <Selector bind:value={props.spec.selector}/>
    </div>
</div>