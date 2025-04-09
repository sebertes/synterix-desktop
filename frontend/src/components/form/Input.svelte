<script>
    import {getContext} from "svelte";
    import TipIcon from "components/icons/TipIcon.svelte";
    import ArrowDownIcon from "components/icons/ArrowDownIcon.svelte";

    let {
        name,
        type = 'text',
        label,
        value = $bindable(),
        placeholder,
        unit,
        tip,
        style,
        disabled = false,
        onblur
    } = $props();
    let isShow = $state(false);
    let isAddon = $derived.by(() => {
        return (type === 'number' || type === 'password') || !!unit || !!tip;
    });
    let isHideAddon = $derived.by(() => {
        return !unit && !tip && type === 'number';
    });
    let displayType = $derived.by(() => {
        if (type === 'password') {
            return isShow ? 'text' : 'password';
        } else {
            return type;
        }
    });

    (getContext("form") || []).push({
        getName: () => name,
        getValue: () => value,
        setValue: (val) => value = val,
        validate: () => ({
            result: !!value,
            message: value ? "" : "Please enter a value"
        })
    });
</script>

<label class={["label-input",unit&&'with-unit',disabled&&'disabled']} {style}>
    <div class="tip">{label}</div>
    <div class="label-input-in">
        <input type={displayType} bind:value={value} placeholder={placeholder} disabled={disabled}
               onblur={()=>onblur&&onblur(value)} autocapitalize="off" autocomplete="off" spellcheck="false"/>
        {#if isAddon}
            <div class={["label-input-addon",isHideAddon&&'hidden']}>
                {#if type === 'number'}
                    <div class="label-input-btns">
                        <button class="dived label-input-btn" style="transform: rotate(180deg)"
                                onclick={() => value = value + 1}>
                            <ArrowDownIcon/>
                        </button>
                        <button class="dived label-input-btn" onclick={() => value = value - 1}>
                            <ArrowDownIcon/>
                        </button>
                    </div>
                {/if}
                {#if unit}
                    <span class="input-unit">{unit}</span>
                {/if}
                {#if type === 'password'}
                    <button class="dived linkable" onclick={() => isShow = !isShow}>{isShow ? 'Hide' : 'Show'}</button>
                {/if}
                {#if tip}
                    <div class="label-input-tip">
                        <TipIcon/>
                        <div class="label-input-tip-desc">{tip}</div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</label>

<style lang="scss">

</style>