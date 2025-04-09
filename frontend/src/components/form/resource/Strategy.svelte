<script>
    import RadioGroup from "components/form/RadioGroup.svelte";
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";

    let {value = $bindable(), disabled} = $props();
    let props = $state({
        type: null,
        rollingUpdate: {
            maxSurge: 25,
            maxSurgeType: '%',
            maxUnavailable: 25,
            maxUnavailableType: '%'
        }
    });

    let options = [
        {
            name: "Rolling Update: Create new pods, until max surge is reached, before deleting old pods. Don't stop more pods than max unavailable.",
            value: "RollingUpdate"
        },
        {name: "Recreate: Kill ALL pods, then start new pods.", value: "Recreate"},
    ];

    $effect(() => {
        if (value) {
            let surge = getValue(value.rollingUpdate?.maxSurge || 25);
            let unavailable = getValue(value.rollingUpdate?.maxUnavailable || 25);
            props = {
                type: value.type,
                rollingUpdate: {
                    maxSurge: surge.value,
                    maxSurgeType: surge.type,
                    maxUnavailable: unavailable.value,
                    maxUnavailableType: unavailable.type
                }
            }
        }
    });

    function update() {
        let r = {
            type: props.type,
            rollingUpdate: {
                maxSurge: setValue(props.rollingUpdate.maxSurge, props.rollingUpdate.maxSurgeType),
                maxUnavailable: setValue(props.rollingUpdate.maxUnavailable, props.rollingUpdate.maxUnavailableType)
            }
        }
        value = r;
    }

    function getValue(a) {
        if (a) {
            if (a.endsWith('%')) {
                return {value: parseInt(a), type: '%'};
            }
            return {value: a, type: 'pods'};
        }
        return {
            value: a,
            type: "%"
        }
    }

    function setValue(value, type) {
        if (type === 'pods') {
            return value;
        }
        return `${value}${type}`;
    }
</script>

<div class="section">
    <div class="block colum-1">
        <RadioGroup options={options} bind:value={props.type} disabled={disabled} callback={update}/>
    </div>
</div>
{#if props.type === 'RollingUpdate'}
    <div class="section">
        <div class="block">
            <div class="field">
                <div class="label-input-group">
                    <Input label="Max Surge" type="number" bind:value="{props.rollingUpdate.maxSurge}" onblur={update}
                           disabled={disabled}/>
                    <Select style="width: 160px;" label="Percentage" bind:value={props.rollingUpdate.maxSurgeType}
                            options={[
                        {name: "Pods", value: "pods"},
                        {name: "%", value: "%"},
                    ]} onClose={update} disabled={disabled}/>
                </div>
            </div>
            <div class="field">
                <div class="label-input-group">
                    <Input label="Max Unavailable" bind:value="{props.rollingUpdate.maxUnavailable}" onblur={update}
                           disabled={disabled}/>
                    <Select style="width: 160px;" label="Percentage" bind:value={props.rollingUpdate.maxUnavailableType}
                            options={[
                        {name: "Pods", value: "pods"},
                        {name: "%", value: "%"},
                    ]} onClose={update} disabled={disabled}/>
                </div>
            </div>
        </div>
    </div>
{/if}