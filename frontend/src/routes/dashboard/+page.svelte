<script>
    import UserIntro from "components/UserIntro.svelte";
    import EdgeList from "components/EdgeList.svelte";
    import ProxyList from "components/ProxyList.svelte";
    import Background from "components/images/Background.svelte";
    import Welcome2 from "components/images/Welcome2.svelte";
</script>

<UserIntro/>
<div class="index-boxy">
    <div class="middle">
        <div class="left">
            <Background/>
        </div>
        <div class="bg">
            <Welcome2/>
        </div>
        <div class="welcome">Welcome to Synterix</div>
    </div>
    <div class="main-body">
        <EdgeList/>
        <div class="padding"></div>
        <ProxyList/>
    </div>
</div>

<style lang="scss">
  .index-boxy {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
  }

  .middle {
    height: 200px;
    overflow: hidden;
    background: $primaryContainer;
    position: relative;

    .left {
      position: absolute;
      left: -50px;
      width: 600px;
      top: 30px;
      transform: rotate(-20deg);
    }

    .bg {
      width: 600px;
      position: absolute;
      top: -130px;
      right: 120px;
      transform: rotate(-40deg);
    }

    .welcome {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      text-align: center;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .main-body {
    padding: 0 80px 80px 80px;

    .padding {
      height: 30px;
    }
  }
</style>