<script>
    import Input from "components/form/Input.svelte";

    let {value, label = '', callback, disabled} = $props();
    let list = $state({});

    function add() {
        list.push({id: Math.random(), name: '', value: ''});
        update();
    }

    function remove(header) {
        list = list.filter(a => a.id !== header.id);
        update();
    }

    $effect(() => {
        if (!value) {
            list = [];
        } else {
            list = value.map(a => {
                return {
                    id: Math.random(),
                    name: a.name,
                    value: a.value
                }
            });
        }
    })

    function update() {
        let r = list.map(a => {
            return {
                name: a.name,
                value: a.value
            }
        });
        callback && callback(r);
    }
</script>

<div class="section">
    <div class="sub-title">{label}</div>
    {#each list as header}
        <div class="block header-grid">
            <div class="field">
                <Input label="Name" bind:value={header.name} onblur={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <Input label="Value" bind:value={header.value} onblur={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" onclick={()=>remove(header)} disabled={disabled}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add {label}</button>
    </div>
</div>

<style lang="scss">
  .header-grid {
    grid-template-columns: 1fr 1fr 80px;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>