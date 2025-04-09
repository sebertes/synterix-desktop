<script>
    import {optionsProvider} from "store/Synterix.svelte.js";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import CheckIcon from "components/icons/CheckIcon.svelte";
    import {toastProvider} from "store/Common.svelte.js";

    let {key} = $props();
    let metadata = optionsProvider.get(key);
    let value = optionsProvider.getValue(key) || metadata.defaultValue;

    async function setValue() {
        if (metadata.onupdate) {
            try {
                await metadata.onupdate({key, value});
            } catch (e) {
                toastProvider.error(e);
            }
        } else {
            await optionsProvider.setValue(key, value);
        }
    }
</script>

<div class="body">
    <div class="title">
        <a href="/setting">Advanced Setting:</a>
        Advanced Settings
    </div>
    <div class="line"></div>
    <div class="item">
        <div class="name">{metadata.name}</div>
        <div class="desc">{metadata.desc}</div>
        <div class="value">
            <div class="label-input">
                <div class="tip">Value</div>
                <input type="text" bind:value={value} autocapitalize="off" autocomplete="off" spellcheck="false"/>
            </div>
        </div>
    </div>
    <div class="btns">
        <div class="btn-group">
            <button class="btn">
                <CrossIcon/>
                Cancel
            </button>
            <button class="btn" onclick={()=>setValue()}>
                <CheckIcon/>
                Save
            </button>
        </div>
    </div>
</div>

<style lang="scss">
  .body {
    margin: 30px 80px 30px 80px;
  }

  .title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .line {
    height: 1px;
    background: $outlineVariant;
    margin: 20px 0 20px 0;
  }

  .item {
    position: relative;

    .desc {
      color: $secondary;
      margin: 10px 0 10px 0;
    }

    .value {
      background: $background;

      input {
        width: 100%;
      }
    }

    .edit {
      position: absolute;
      top: 10px;
      right: 10px;
      border-radius: 5px;
      line-height: 30px;
      text-align: center;
      width: 30px;
      border: 1px solid $primary;
    }
  }

  .btns {
    text-align: right;
    margin-top: 20px;
  }
</style>