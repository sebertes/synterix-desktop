<script>
    import LoadingBg from "components/images/LoadingBg.svelte";
    import LoadingIcon from "components/icons/LoadingIcon.svelte";
</script>

<div class="workload-content">
    <div class="workload-loading">
        <div class="kit">
            <div class="circle spinner"><LoadingIcon/></div>
        </div>
        <div class="desc">Loading...</div>
    </div>
    <div class="workload-loading-bg">
        <div class="workload-loading-bg-inner">
            <div class="workload-loading-pic">
                <LoadingBg/>
            </div>
            <div class="workload-loading-desc">Loading...</div>
        </div>
    </div>
</div>