<script>
    let {value = $bindable(), label, callback,disabled} = $props();

    function onChange(e) {
        value = e.target.checked;
        callback && callback(value);
    }
</script>

<label>
    <input type="checkbox" checked={value} onchange={e=>onChange(e)} disabled={disabled}/>
    <span>{label}</span>
</label>