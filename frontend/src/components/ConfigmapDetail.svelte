<script>
    import {Utils} from "lib";
    import CopyBtn from "components/CopyBtn.svelte";

    let {configmap} = $props();
    let values = $derived.by(() => {
        if (configmap.data) {
            return Reflect.ownKeys(configmap.data || {}).map(a => {
                return {
                    key: a,
                    type: 'data',
                    value: configmap.data[a]
                }
            });
        } else if (configmap.binaryData) {
            return Reflect.ownKeys(configmap.binaryData || {}).map(a => {
                return {
                    key: a,
                    type: 'binary',
                    value: `<span><</span>Binary Data: ${Utils.getBase64SizeInBytes(configmap.binaryData[a])} bytes<span>></span>`
                }
            });
        }
        return [];
    });
</script>

{#if values.length > 0}
    {#each values as {key, value, type}}
        <div class="prop">
            <div class="key">
                <div class="key-name">{key}</div>
                <div class="key-copy">
                    {#if type === 'data'}
                        <CopyBtn content={value}/>
                    {/if}
                </div>
            </div>
            <div class="body">
                <pre class="value">{@html value}</pre>
            </div>
        </div>
    {/each}
{:else}
    <div class="no-record">No data to display</div>
{/if}

<style lang="scss">
  .prop {
    padding: 20px;
    background: $background;
    overflow: hidden;

    .key {
      margin-bottom: 5px;
      position: relative;

      .key-name {
        line-height: 35px;
        font-size: 18px;
      }

      .key-copy {
        position: absolute;
        top: 0;
        right: 0;
      }
    }

    .body {
      overflow: auto;
    }

    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  .no-record {
    line-height: 80px;
    text-align: center;
  }
</style>