<script>
    import Select from "components/form/Select.svelte";
    import StringArray from "components/form/resource/StringArray.svelte";
    import {ResourcesUtils} from "store/resource/ResourceUtils.svelte.js";

    let {value = $bindable(), callback, disabled} = $props();
    let props = $state({
        secretName: "",
        hosts: []
    });
    let serviceList = $state([]);

    $effect(() => {
        if (value) {
            props = {
                secretName: value.secretName,
                hosts: value.hosts || [""]
            };
        }
    });
    $effect(() => {
        ResourcesUtils.ready("Secret",resource=>{
            serviceList = resource.getAllRawList().map(a => {
                return {
                    name: a.metadata.name,
                    value: a.metadata.name
                }
            });
        })
    });

    function update() {
        callback && callback({
            secretName: props.secretName,
            hosts: props.hosts || [""]
        });
    }

</script>
<div class="section">
    <div class="block port-grid">
        <div class="field">
            <div class="sub-title">Secret</div>
            <Select label="Secret Name" options={serviceList}
                    bind:value={props.secretName}
                    onClose={()=>update()}
                    disabled={disabled}/>
        </div>
        <div class="field">
            <div class="sub-title">Hosts</div>
            <StringArray bind:value={props.hosts}
                         disabled={disabled}
                         callback={()=>update()}/>
        </div>
    </div>
</div>

<style lang="scss">
  .port-grid {
    grid-template-columns: 1fr 1fr 80px;
  }

  .remove {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
  }
</style>