<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";

    let {command, args, workingDir, stdin, callback,disabled} = $props();
    let props = $state({});

    let stdioTypes = [
        {name: "No", value: "no"},
        {name: "Once", value: "once"},
        {name: "Yes", value: "yes"}
    ];

    $effect(() => {
        props.command = command;
        props.args = args;
        props.workingDir = workingDir;
        props.stdin = stdin;
    });

    function update() {
        callback && callback({
            command: props.command,
            args: props.args,
            workingDir: props.workingDir,
            stdin: props.stdin
        });
    }
</script>

<div class="section">
    <div class="title">Command</div>
    <div class="block">
        <div class="field">
            <Input label="Command" bind:value={props.command} placeholder="e.g. /bin/sh" onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="Args" bind:value={props.args} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="WorkingDir" bind:value={props.workingDir} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Select label="Stdin" bind:value={props.stdin} options={stdioTypes} onClose={update} disabled={disabled}/>
        </div>
    </div>
</div>