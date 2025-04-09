<script>
    import Input from "components/form/Input.svelte";
    import {Utils} from "lib/index.js";

    let {label, value = {}, callback, disabled} = $props();
    let mapList = $state([]);

    function add() {
        mapList.push({
            id: Utils.getRandomId(),
            name: "",
            value: "",
        });
    }

    function remove(env) {
        let i = mapList.findIndex(a => a.id === env.id);
        if (i !== -1) {
            mapList.splice(i, 1);
            update();
        }
    }

    $effect(() => {
        mapList = Reflect.ownKeys(value).map(key => {
            return {
                id: key,
                name: key,
                value: value[key],
            };
        });
    });

    function update() {
        let t = {};
        mapList.forEach(env => {
            if (env.name) {
                t[env.name] = env.value;
            }
        });
        callback && callback(t);
    }
</script>

<div class="section">
    <div class="title">{label}</div>
    {#each mapList as map}
        <div class="block env-grid">
            <div class="field">
                <Input label="Key" bind:value={map.name} onblur={()=>update()} disabled={disabled}/>
            </div>
            <div class="field">
                <Input label="Value" bind:value={map.value} onblur={update} disabled={disabled}/>
            </div>
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" disabled={disabled} onclick={()=>remove(map)}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <button class="btn btn-primary" disabled={disabled} onclick={()=>add()}>Add {label}</button>
    </div>
</div>

<style lang="scss">
  .env-grid {
    grid-template-columns: 1fr 1fr 80px;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>