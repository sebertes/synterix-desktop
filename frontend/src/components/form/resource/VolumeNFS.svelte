<script>
    import Input from "components/form/Input.svelte";
    import CheckboxToggleBtn from "components/form/CheckboxToggleBtn.svelte";

    let {value, callback, disabled} = $props();
    let props = $state({
        name: "",
        nfs: {
            server: '',
            path: '',
            readOnly: false
        }
    });

    function update() {
        callback && callback({
            name: props.name,
            nfs: {
                server: props.nfs.server,
                path: props.nfs.path,
                readOnly: props.nfs.readOnly,
            }
        });
    }

    $effect(() => {
        if (value) {
            props = {
                name: value.name,
                nfs: {
                    server: value.nfs.server,
                    path: value.nfs.path,
                    readOnly: value.nfs.readOnly || false,
                }
            };
        }
    })
</script>

<div class="section">
    <div class="title">NFS</div>
    <div class="block colum-2">
        <div class="field">
            <Input label="Volume Name" bind:value={props.name} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <div class="to-left">
                <CheckboxToggleBtn label="Read Only" bind:value={props.nfs.readOnly} callback={update}
                                   disabled={disabled}/>
            </div>
        </div>
    </div>
    <div class="block colum-2">
        <div class="field">
            <Input label="Server" bind:value={props.nfs.server} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="Path" bind:value={props.nfs.path} onblur={update} disabled={disabled}/>
        </div>
    </div>
</div>