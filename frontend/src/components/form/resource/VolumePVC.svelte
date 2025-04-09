<script>
    import Input from "components/form/Input.svelte";
    import CheckboxToggleBtn from "components/form/CheckboxToggleBtn.svelte";

    let {value, callback, disabled} = $props();
    let props = $state({
        name: "",
        persistentVolumeClaim: {
            claimName: '',
            readOnly: false
        }
    });

    function update() {
        callback && callback({
            name: props.name,
            persistentVolumeClaim: {
                claimName: props.persistentVolumeClaim.claimName,
                readOnly: props.persistentVolumeClaim.readOnly,
            }
        });
    }

    $effect(() => {
        if (value) {
            props = {
                name: value.name,
                persistentVolumeClaim: {
                    claimName: value.persistentVolumeClaim.claimName,
                    readOnly: value.persistentVolumeClaim.readOnly || false,
                }
            };
        }
    })
</script>

<div class="section">
    <div class="title">Persistent Volume Claim</div>
    <div class="block colum-2">
        <div class="field">
            <Input label="Name" bind:value={props.name} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="claimName" bind:value={props.persistentVolumeClaim.claimName} onblur={update}
                   disabled={disabled}/>
        </div>
    </div>
    <div class="block colum-2">
        <div class="field">
            <div class="to-left">
                <CheckboxToggleBtn label="Read Only" bind:value={props.persistentVolumeClaim.readOnly} callback={update}
                                   disabled={disabled}/>
            </div>
        </div>
    </div>
</div>