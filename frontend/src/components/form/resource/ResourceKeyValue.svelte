<script>
    import KeyValue from "components/form/resource/KeyValue.svelte";

    let {option, value = $bindable(), disabled} = $props();
    let props = $state({});

    $effect(() => {
        if (value) {
            props = {...value};
        }
    })

    function update() {
        value = props;
    }
</script>

<div class="section">
    <div class="block colum-1">
        <KeyValue {...option}
                  bind:value={props}
                  disabled={disabled}
                  callback={v=>(props=v)&&update()}/>
    </div>
</div>