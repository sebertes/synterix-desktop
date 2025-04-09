<script>
    import UserIntro from "components/UserIntro.svelte";
    import {themeManager} from "store/Synterix.svelte.js";
</script>

<UserIntro/>
<div class="body">
    <div class="title">Preferences</div>
    <div class="sub-title">Theme</div>
    <div class="btn-group">
        <div class={["btn",themeManager.isDark()&&'hover']} onclick={()=>themeManager.toDark()}>Dark</div>
        <div class={["btn",!themeManager.isDark()&&'hover']} onclick={()=>themeManager.toLight()}>Light</div>
    </div>
    <div class="desc">Auto uses OS preference if available, or dark from 6:00 pm to 6:00 am</div>
    <!--    <div class="line"></div>-->
    <!--    <div class="sub-title">Formatting</div>-->
    <!--    <div class="selects">-->
    <!--        <div class="select">-->
    <!--            <div class="label">Date Format</div>-->
    <!--            <select>-->
    <!--                <option>24h</option>-->
    <!--                <option>12h</option>-->
    <!--                <option>Auto</option>-->
    <!--            </select>-->
    <!--            <div class="arrow">-->
    <!--                <ArrowDownIcon/>-->
    <!--            </div>-->
    <!--        </div>-->
    <!--        <div class="select">-->
    <!--            <div class="label">Table Rows per Page</div>-->
    <!--            <select>-->
    <!--                <option>24h</option>-->
    <!--                <option>12h</option>-->
    <!--                <option>Auto</option>-->
    <!--            </select>-->
    <!--            <div class="arrow">-->
    <!--                <ArrowDownIcon/>-->
    <!--            </div>-->
    <!--        </div>-->
    <!--        <div class="select">-->
    <!--            <div class="label">Number of clusters to show in side menu</div>-->
    <!--            <select>-->
    <!--                <option>24h</option>-->
    <!--                <option>12h</option>-->
    <!--                <option>Auto</option>-->
    <!--            </select>-->
    <!--            <div class="arrow">-->
    <!--                <ArrowDownIcon/>-->
    <!--            </div>-->
    <!--        </div>-->
    <!--    </div>-->
    <!--    <div class="line"></div>-->
    <!--    <div class="sub-title">YAML Editor Key Mapping</div>-->
    <!--    <div class="btn-group">-->
    <!--        <div class="btn">Normal human</div>-->
    <!--        <div class="btn hover">Emacs</div>-->
    <!--        <div class="btn">Vim</div>-->
    <!--    </div>-->
</div>

<style lang="scss">
  .body {
    padding: 30px 80px 30px 80px;

    .title {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .sub-title {
      font-size: 16px;
      margin-bottom: 10px;
    }

    .desc {
      line-height: 30px;
      margin-top: 10px;
    }

    .line {
      height: 1px;
      background: $outlineVariant;
      margin: 20px 0 20px 0;
    }

    .selects {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-top: 10px;

      .select {
        background: $surface;
        border: 1px solid $outlineVariant;
        border-radius: 4px;
        color: $onSurface;
        transition: all 0.3s ease;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
        vertical-align: middle;
        position: relative;

        .label {
          font-size: 12px;
          padding: 10px 10px 0 10px;
          color: $outline;
        }

        select {
          all: unset;
          width: 100%;
          box-sizing: border-box;
          padding: 10px 10px 10px 10px;
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

          svg {
            transform: rotate(90deg);
          }
        }

        &:hover {
          background: $surfaceContainerLowest;
        }

        &:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-hover);
        }
      }
    }
  }
</style>