<script>
    import Input from "components/form/Input.svelte";

    let {value} = $props();
    let securityContext = $state({
        runAsUser: "",
        runAsGroup: "",
        fsGroup: ""
    });

    $effect(() => {
        if (value) {
            securityContext = value;
        }
    })
</script>

<div class="section">
    <div class="block">
        <div class="field">
            <Input label="Run as User Id"/>
        </div>
    </div>
    <div class="block">
        <div class="field">
            <Input label="Run as User Id"/>
        </div>
        <div class="field">
            <Input label="Run as User Id"/>
        </div>
    </div>
    <div class="title">Pod Filesystem Group</div>
    <div class="block">
        <div class="field">
            <Input label="Run as User Id"/>
        </div>
    </div>
</div>