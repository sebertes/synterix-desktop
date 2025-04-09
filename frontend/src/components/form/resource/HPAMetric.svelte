<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";
    import KeyValue from "components/form/resource/KeyValue.svelte";

    let {value = $bindable(), disabled, callback} = $props();
    let type = $state('Resource');
    let resourceName = $state("cpu");
    let target = $state({
        type: 'AverageValue',
        value: null,
    });
    let metric = $state({
        name: null,
        selector: {
            matchLabels: {}
        }
    });
    let describedObject = $state({
        apiVersion: null,
        kind: null,
        name: null
    });


    let resourceTypes = [
        {name: 'Resource', value: 'Resource'},
        {name: 'Pods', value: 'Pods'},
        {name: 'External', value: 'External'},
        {name: 'Object', value: 'Object'},
    ];
    let resourceNames = [
        {name: 'cpu', value: 'cpu'},
        {name: 'memory', value: 'memory'},
    ]
    let valueTypes = [
        {name: 'AverageValue', value: 'AverageValue'},
        {name: 'Utilization', value: 'Utilization'},
    ];

    $effect(() => {
        if (value) {
            type = value.type;
            let typeProp = value.type.toLowerCase();
            if (value[typeProp]?.target) {
                target.type = value[typeProp].target.type;
                if (value[typeProp].target.averageUtilization) {
                    target.value = parseInt(value[typeProp].target.averageUtilization);
                }
                if (value[typeProp].target.averageValue) {
                    target.value = parseInt(value[typeProp].target.averageValue);
                }
            }
            if (value[typeProp]?.metric) {
                metric.name = value[typeProp].metric.name;
                metric.selector.matchLabels = value[typeProp].metric?.selector?.matchLabels || {};
            }
            if (value[typeProp]?.describedObject) {
                describedObject.apiVersion = value[typeProp].describedObject.apiVersion;
                describedObject.kind = value[typeProp].describedObject.kind;
                describedObject.name = value[typeProp].describedObject.name;
            }
        }
    });

    function update() {
        let r = {
            type: type,
        };
        let _target = {
            type: target.type,
        }
        if (target.type === 'AverageValue') {
            _target.averageValue = `${target.value}`;
        } else {
            _target.averageUtilization = `${target.value}`;
        }
        if (type === 'Resource') {
            r.resource = {
                name: resourceName,
                target: _target
            }
        } else if (type === 'Pods') {
            r.pods = {
                metric: {
                    name: metric.name,
                    selector: {
                        matchLabels: {...metric.selector.matchLabels}
                    }
                },
                target: _target
            }
        } else if (type === 'Object') {
            r.object = {
                describedObject: {
                    apiVersion: describedObject.apiVersion,
                    kind: describedObject.kind,
                    name: describedObject.name
                },
                metric: {
                    name: metric.name,
                    selector: {
                        matchLabels: {...metric.selector.matchLabels}
                    }
                },
                target: _target
            }
        } else if (type === 'External') {
            r.external = {
                metric: {
                    name: metric.name,
                    selector: {
                        matchLabels: {...metric.selector.matchLabels}
                    }
                },
                target: _target
            }
        }
        callback && callback(r);
    }

    function updateKv(value) {
        Object.assign(metric.selector, {matchLabels: value});
        update();
    }
</script>

<div class="section">
    <div class="block colum-2">
        <Select options={resourceTypes} label="Source" bind:value={type} onClose={update}/>
    </div>
    {#if type === 'Resource'}
        <div class="block colum-2">
            <Select bind:value={resourceName} options={resourceNames} onClose={update}/>
        </div>
    {/if}
    <div class="block colum-2">
        <div class="field">
            <Select options={valueTypes} label="Type" bind:value={target.type} onClose={update}/>
        </div>
        <div class="field">
            <Input label="Value" bind:value={target.value} type="number" onblur={update}/>
        </div>
    </div>
    {#if type !== 'Resource'}
        <div class="block colum-2">
            <div class="field">
                <Input label="Metric Name" bind:value={metric.name} onblur={update}/>
            </div>
        </div>
        {#if type === 'Object'}
            <div class="block colum-3">
                <div class="field">
                    <Input label="ApiVersion" bind:value={describedObject.apiVersion} onblur={update}/>
                </div>
                <div class="field">
                    <Input label="Kind" bind:value={describedObject.kind} onblur={update}/>
                </div>
                <div class="field">
                    <Input label="Name" bind:value={describedObject.name} onblur={update}/>
                </div>
            </div>
        {/if}
        <div class="sub-title">Metric Selector</div>
        <div class="block colum-1">
            <KeyValue
                    value={metric.selector.matchLabels}
                    callback={v=>updateKv(v)}/>
        </div>
    {/if}
</div>