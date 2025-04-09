<script>
    import ArrowDownIcon from "components/icons/ArrowDownIcon.svelte";
    import {getContext} from "svelte";

    let {
        name,
        label = 'Select label',
        value = $bindable(),
        placeholder,
        options = [],
        style,
        disabled = false,
        callback,
        onOpen,
        onClose,
    } = $props();
    let input, optionPanel;
    let opened = $state(false);
    let displayValue = $derived.by(() => {
        return (value || []).map(a => {
            return options.find(option => option.value === a);
        }).filter(a => !!a);
    })

    getContext("form") && getContext("form").push({
        getName: () => name,
        getValue: () => value,
        setValue: (val) => value = val,
        validate: () => ({
            result: !!value,
            message: value ? "" : "Please enter a value"
        })
    });

    function calculatePosition() {
        const inputRect = input.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const optionsHeight = optionPanel.offsetHeight;
        const spaceBelow = windowHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;
        if (spaceBelow > optionsHeight || spaceBelow > spaceAbove) {
            optionPanel.style.top = `${inputRect.height}px`; /* 下方显示 */
        } else {
            optionPanel.style.top = `-${optionsHeight}px`; /* 上方显示 */
        }
    }

    function selectItem(e, option) {
        if (value) {
            let t = value.indexOf(option.value);
            if (t === -1) {
                value.push(option.value);
            } else {
                value.splice(t, 1);
            }
        } else {
            value = [option.value];
        }
        opened = false;
        callback && callback(value);
        onClose && onClose();
        e.stopPropagation();
    }

    function handleClickOutside(e) {
        if (!input.contains(e.target)) {
            opened = false;
        }
    }

    function handleResize() {
        if (opened) {
            calculatePosition();
        }
    }

    function onInputClick(e) {
        if (disabled) {
            return;
        }
        if (!opened) {
            opened = true;
            onOpen && onOpen();
            setTimeout(() => calculatePosition());
        }
    }
</script>

<svelte:window onclick={handleClickOutside} onresize={handleResize}></svelte:window>
<div class={["label-input",disabled&&'disabled']} bind:this={input} {style}>
    <label>
        <div class="tip">{label}</div>
        <div class={["values",disabled&&'disabled']} onclick={(e)=>onInputClick(e)}>
            {#each displayValue as option}
                <div class="value">{option.name}</div>
            {/each}
        </div>
        <div class={["arrow",opened&&"open"]}>
            <ArrowDownIcon/>
        </div>
    </label>
    <div class={["options",opened&&"active"]} bind:this={optionPanel}>
        {#each options as option}
            <div class={["item",(value||[]).indexOf(option.value)!==-1&&"active"]}
                 onclick={e=>selectItem(e,option)}>{option.name}</div>
        {/each}
    </div>
</div>

<style lang="scss">
  .values {
    min-height: 25px;
    padding: 5px 0 5px 0;

    .value {
      padding: 0 5px 0 5px;
      background-color: $infoColorContainer;
      color: $infoOnColorContainer;
      margin: 5px;
      border-radius: 5px;
      line-height: 20px;
      display: inline-block;
    }
  }

  .options {
    position: absolute;
    left: 0;
    top: 100%;
    right: 0;
    background: $surfaceContainerLowest;
    @include elevation(2);
    z-index: 1000;
    padding: 10px 0;
    border-radius: 4px; // 统一圆角
    display: none;
    transition: box-shadow 0.3s ease, color 0.3s ease;
    max-height: 300px;
    overflow: auto;

    &:hover {
      @include elevation(3);
    }

    .item {
      line-height: 35px;
      padding: 0 15px 0 15px;
      font-size: 13px;
      color: $onSurface;
      transition: background-color 0.3s ease, color 0.3s ease;
      white-space: nowrap;

      &.active {
        background: $primaryContainer;
        color: $onPrimaryContainer;
      }

      &:hover {
        background: $primaryContainer;
        color: $onPrimaryContainer;
      }
    }

    &.active {
      display: block;
    }
  }

  .arrow {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 40px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;

    &.open {
      transform: rotate(180deg);
    }
  }
</style>