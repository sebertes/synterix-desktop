<script>
    import StringArray from "components/form/resource/StringArray.svelte";
    import NameValue from "components/form/resource/NameValue.svelte";

    let {value = $bindable(),disabled} = $props();
    let props = $state({
        nameservers: [],
        searches: [],
        options: []
    });

    $effect(() => {
        if (value) {
            props = {
                nameservers: value.nameservers || [],
                searches: value.searches || [],
                options: value.options || []
            }
        }
    })

    function update() {
        value = {
            nameservers: props.nameservers,
            searches: props.searches,
            options: props.options
        }
    }
</script>

<div class="section">
    <div class="departs">
        <div class="section-part">
            <StringArray label={'Nameservers'} bind:value={props.nameservers} callback={update} disabled={disabled}/>
        </div>
        <div class="section-part">
            <StringArray label={'Search Domains'} bind:value={props.searches} callback={update} disabled={disabled}/>
        </div>
    </div>
</div>
<NameValue label={'Resolver Options'} value={props.options} callback={v=>(props.options=v)&&update()} disabled={disabled}/>

<style lang="scss">
  .departs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
</style>