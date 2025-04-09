<script>
    import Notfound from "components/images/Notfound.svelte";
</script>

<div class="content">
    <div class="header">
        <div class="header-title">Not Found</div>
    </div>
    <div class="body">
        <div class="image">
            <Notfound/>
            <div class="desc">No support action</div>
        </div>
    </div>
</div>

<style lang="scss">
  .content {
    padding: 30px 20px 20px 20px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .header {
      position: relative;

      .header-title {
        font-size: 24px;
        display: inline-block;
        padding-left: 40px;
      }

      .header-right {
        float: right;
      }
    }

    .body {
      margin-top: 20px;
      position: absolute;
      top: 100px;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .image {
      width: 30%;
      position: absolute;
      top:50%;
      left:50%;
      transform: translate(-50%,-60%);
      .desc{
        line-height: 50px;
        text-align: center;
        font-size: 15px;
        border-top:1px solid $outlineVariant;
      }
    }
  }
</style>