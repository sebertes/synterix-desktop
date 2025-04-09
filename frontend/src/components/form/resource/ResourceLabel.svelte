<script>
    let {option, value = $bindable(), disabled} = $props();
</script>

<div class="section">
    <div class="block colum-3">
        <div class="r-input">{value}</div>
    </div>
</div>

<style lang="scss">
  .r-input {
    line-height: 60px;
    padding: 0 20px 0 20px;
    border: 1px solid $outlineVariant;
    background-color: $surface;
    border-radius: 3px;
  }
</style>