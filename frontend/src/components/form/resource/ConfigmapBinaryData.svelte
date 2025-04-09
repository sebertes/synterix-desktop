<script>
    import Input from "components/form/Input.svelte";
    import {Utils} from "lib/index.js";

    let {value = $bindable({}), label, callback, disabled} = $props();
    let mapList = $state([]);
    let file = null;

    function add() {
        file && file.click();
    }

    function remove(env) {
        let i = mapList.findIndex(a => a.id === env.id);
        if (i !== -1) {
            mapList.splice(i, 1);
        }
        update();
    }

    function getFileContent(e) {
        let file = e.target.files[0];
        if (!file) {
            console.log('未选择文件');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Data = e.target.result.split(',')[1];
            mapList.push({
                id: Utils.getRandomId(),
                name: file.name,
                value: base64Data,
            });
        };
        reader.onerror = (e) => {
            console.error('文件读取失败:', e);
        };
        reader.readAsDataURL(file);
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
        value = t;
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
                <div class="data-bytes">Binary Data: {Utils.getBase64SizeInBytes(map.value)} bytes</div>
            </div>
            <div class="field">
                <div class="remove">
                    <button class="btn btn-blank" disabled={disabled} onclick={()=>remove(map)}>Remove</button>
                </div>
            </div>
        </div>
    {/each}
    <div class="bottom">
        <input type="file" onchange={e=>getFileContent(e)} style="display: none" bind:this={file}/>
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

  .data-bytes {
    line-height: 60px;
  }
</style>