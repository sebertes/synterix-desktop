<script>
    import Select from "components/form/Select.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value = $bindable(), callback, disabled} = $props();
    let serviceList = $state([]);
    let portList = $state([]);
    let props = $state({
        name: null,
        port: {
            number: null
        }
    });

    $effect(() => {
        if (value) {
            props = {
                name: value.name,
                port: {
                    number: value.port.number
                }
            };
        }
    })
    $effect(() => {
        ResourcesUtils.ready("Service", resource => {
            serviceList = resource.getAllRawList().map(a => {
                return {name: a.metadata.name, value: a.metadata.name, data: a};
            });
        })
    });
    $effect(() => {
        if (props.name) {
            let t = serviceList.find(a => a.value === props.name);
            if (t) {
                portList = t.data.spec.ports.map(a => {
                    return {name: a.port, value: a.port, data: a};
                });
            }
        }
    })

    function update() {
        value = {
            name: props.name,
            port: {
                number: props.port.number
            }
        };
    }
</script>

<div class="section">
    <div class="block colum-2">
        <div class="field">
            <Select label="Service" options={serviceList} bind:value={props.name} disabled={disabled} onClose={update}/>
        </div>
        <div class="field">
            <Select label="Port" options={portList} bind:value={props.port.number} disabled={disabled}
                    onClose={update}/>
        </div>
    </div>
</div>