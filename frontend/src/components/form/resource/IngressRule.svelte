<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value = $bindable([]), callback, disabled} = $props();
    let portList = $state([]);
    let serviceList = $state([]);

    let pathTypes = [
        {name: "ImplementationSpecific", value: "ImplementationSpecific"},
        {name: "Prefix", value: "Prefix"},
        {name: "Exact", value: "Exact"},
    ]

    function add() {
        portList.push({
            id: Math.random(),
            backend: {
                service: {
                    name: "",
                    port: {
                        number: 80
                    }
                }
            },
            path: "",
            pathType: "",
        });
    }

    function remove(port) {
        portList = portList.filter(a => a.id !== port.id);
        update();
    }

    $effect(() => {
        if (value) {
            portList = value.map(a => {
                return {
                    id: Math.random(),
                    backend: {
                        service: {
                            name: a.backend.service.name,
                            port: {
                                number: a.backend.service.port.number
                            }
                        }
                    },
                    path: a.path,
                    pathType: a.pathType,
                };
            });
        }
    });
    $effect(() => {
        ResourcesUtils.ready("Service", resource => {
            serviceList = resource.getAllRawList().map(a => {
                return {
                    name: a.metadata.name,
                    value: a.metadata.name,
                    ports: (a.spec.ports || []).map(b => {
                        return {
                            name: b.port,
                            value: b.port
                        }
                    })
                }
            });
        })
    });

    function getPortList(name) {
        let t = (serviceList || []).find(a => a.value === name);
        if (t) {
            return t.ports;
        }
        return [];
    }

    function update() {
        let t = portList.map((a) => {
            return {
                backend: {
                    service: {
                        name: a.backend.service.name,
                        port: {
                            number: a.backend.service.port.number
                        }
                    }
                },
                path: a.path,
                pathType: a.pathType,
            };
        });
        callback && callback(t);
    }

</script>
<div class="section">
    <div class="title">Paths</div>
    {#each portList as port}
        <div class="block port-grid">
            <div class="field">
                <Select label="PathType" options={pathTypes} bind:value={port.pathType} onClose={()=>update()}
                        disabled={disabled}/>
            </div>
            <div class="field">
                <Input label="Path" bind:value={port.path} disabled={disabled} onblur={update}/>
            </div>
            <div class="field">
                <Select options={serviceList} label="Service" bind:value={port.backend.service.name}
                        onClose={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <Select label="Port" options={getPortList(port.backend.service.name)}
                        bind:value={port.backend.service.port.number}
                        onClose={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" onclick={()=>remove(port)} disabled={disabled}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add Path</button>
    </div>
</div>

<style lang="scss">
  .port-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr 80px;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>