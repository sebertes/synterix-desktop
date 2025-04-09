<script>
    import Input from "components/form/Input.svelte";

    let {value, callback, disabled} = $props();
    let resources = $state({
        requests: {cpu: 0, memory: 0},
        limits: {cpu: 0, memory: 0}
    });

    $effect(() => {
        if (!value) {
            resources = {
                requests: {cpu: 0, memory: 0},
                limits: {cpu: 0, memory: 0}
            }
        } else {
            resources = {
                requests: {
                    cpu: parseInt(value.requests?.cpu || 0),
                    memory: parseInt(value.requests?.memory || 0)
                },
                limits: {
                    cpu: parseInt(value.limits?.cpu || 0),
                    memory: parseInt(value.limits?.memory || 0)
                }
            };
        }
    });

    function update() {
        let r = {
            requests: {
                cpu: resources.requests.cpu + "m",
                memory: resources.requests.memory + "Mi"
            },
            limits: {
                cpu: resources.limits.cpu + "m",
                memory: resources.limits.memory + "Mi"
            }
        }
        callback && callback(r);
    }
</script>

<div class="section">
    <div class="title">Resources.requests</div>
    <div class="block colum-2">
        <div class="field">
            <Input label="CPU Reservation" bind:value={resources.requests.cpu} type="number" unit="mCPUs"
                   onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="Memory Reservation" bind:value={resources.requests.memory} type="number" unit="MiB"
                   onblur={update} disabled={disabled}/>
        </div>
    </div>
    <div class="title">Resources.limits</div>
    <div class="block colum-2">
        <div class="field">
            <Input label="CPU Limit" type="number" bind:value={resources.limits.cpu} unit="mCPUs" onblur={update}
                   disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="Memory Limit" type="number" bind:value={resources.limits.memory} unit="MiB" onblur={update}
                   disabled={disabled}/>
        </div>
    </div>
</div>