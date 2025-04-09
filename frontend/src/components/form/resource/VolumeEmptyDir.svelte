<script>
    import Input from "components/form/Input.svelte";

    let {value, callback, disabled} = $props();
    let props = $state({
        name: "",
        emptyDir: {
            medium: '',
            sizeLimit: false
        }
    });

    function update() {
        callback && callback({
            name: props.name,
            emptyDir: {
                medium: props.emptyDir.medium,
                sizeLimit: props.emptyDir.sizeLimit,
            }
        });
    }

    $effect(() => {
        if (value) {
            props = {
                name: value.name,
                emptyDir: {
                    medium: value.emptyDir.medium,
                    sizeLimit: value.emptyDir.sizeLimit,
                }
            };
        }
    })
</script>

<div class="section">
    <div class="title">EmptyDir</div>
    <div class="block colum-3">
        <div class="field">
            <Input label="Name" bind:value={props.name} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="medium" bind:value={props.emptyDir.medium} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="medium" bind:value={props.emptyDir.sizeLimit} onblur={update} disabled={disabled}/>
        </div>
    </div>
</div>