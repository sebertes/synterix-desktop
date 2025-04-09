<script>
    import KeyValue from "components/form/resource/KeyValue.svelte";
    import Rule from "components/form/resource/Rule.svelte";

    let {value = $bindable({}), disabled} = $props();
</script>

<div class="section">
    <div class="block colum-1">
        <KeyValue label={'Match Labels'} value={value.matchLabels} callback={v=>(value.matchLabels=v)}
                  disabled={disabled}/>
    </div>
    <div class="title">Match Expressions</div>
    <div class="block colum-1">
        <Rule label={'Match Expressions'} value={value.matchExpressions}
              callback={v=>(value.matchExpressions=v)}
              disabled={disabled}/>
    </div>
</div>