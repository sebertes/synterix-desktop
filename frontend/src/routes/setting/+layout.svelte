<script>
    import "../../style/global.scss";

    let {children} = $props();
</script>

<svelte:head>
    <title>Synterix</title>
    <meta name="description" content="这Synterix"/>
</svelte:head>
<div class="home-header">
    <div class="logo"></div>
</div>
<div class="home-body">
    {@render children()}
</div>

<style lang="scss">
  .home-header {
    height: 50px;
    display: flex;
    background: $surface;
    border-bottom: 1px solid $outlineVariant;

    .logo {
      width: 120px;
      background-image: $logo;
      background-repeat: no-repeat;
      background-size: auto 26px;
      background-position: center left;
      padding-left: 45px;
      font-size: 22px;
      margin-left: 10px;
    }
  }

  .home-body {
    padding: 0;
    position: absolute;
    top: 51px;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>