<script>
    import {getContext} from "svelte";

    let {label, name, value = $bindable(), options = [], callback, disabled, direct = "v"} = $props();

    function onChange(optionValue) {
        value = optionValue;
        callback && callback(optionValue);
    }

    (getContext("form") || []).push({
        getName: () => name,
        getValue: () => value,
        setValue: (val) => value = val,
        validate: () => ({
            result: !!value,
            message: value ? "" : "Please select a value"
        })
    });
</script>

<div class={["radio-group", direct==="h"?"horizontal":""]}>
    {#each options as option}
        <label>
            <input type="radio" checked={option.value===value} onchange={()=>onChange(option.value)}
                   disabled={disabled} autocapitalize="off" autocomplete="off" spellcheck="false">
            <span>{option.name}</span>
        </label>
    {/each}
</div>

<style lang="scss">
  .radio-group {
    &.horizontal {
      display: flex;
    }
  }
</style>