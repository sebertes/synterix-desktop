<script>
    import Input from "components/form/Input.svelte";

    let {value = $bindable(), label, callback, disabled} = $props();
    let valueList = $state([]);

    function add() {
        valueList.push({
            value: '',
            id: Math.random()
        });
    }

    function remove(env) {
        valueList = valueList.filter(a => a.id !== env.id);
        update();
    }

    $effect(() => {
        if (value) {
            valueList = value.map(a => {
                return {
                    value: a,
                    id: Math.random()
                }
            });
        }
    });

    function update() {
        value = valueList.map(a => a.value);
        callback && callback(value);
    }
</script>

<div class="section">
    {#if label}
        <div class="title">{label}</div>
    {/if}
    {#each valueList as map}
        <div class="block env-grid">
            <div class="field">
                <Input label="Value" bind:value={map.value} onblur={update} disabled={disabled}/>
            </div>
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" onclick={()=>remove(map)} disabled={disabled}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" onclick={()=>add()} disabled={disabled}>Add {label}</button>
    </div>
</div>

<style lang="scss">
  .env-grid {
    grid-template-columns: 1fr 80px;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>