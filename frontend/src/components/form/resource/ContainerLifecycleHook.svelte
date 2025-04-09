<script>
    import RadioGroup from "components/form/RadioGroup.svelte";
    import Input from "components/form/Input.svelte";
    import HttpSet from "components/form/resource/HttpSet.svelte";

    let {label = 'PostStart', value, callback,disabled} = $props();
    let hook = $state({});

    let options = [
        {value: 'none', name: 'None'},
        {value: 'cmd', name: 'Add command to execute'},
        {value: 'http', name: 'Create HTTP request'}
    ];

    $effect(() => {
        let r = {};
        r.path = null;
        r.port = null;
        r.schema = null;
        r.headers = null;
        r.command = null;
        r.host = null;
        if (!value) {
            r.type = 'none';
        } else {
            if (value.httpGet) {
                r.type = 'http';
                r.host = value.httpGet.host;
                r.path = value.httpGet.path;
                r.port = value.httpGet.port;
                r.schema = value.httpGet.scheme;
                r.headers = value.httpGet.httpHeaders || [];
            } else {
                r.type = 'cmd';
                r.command = value.exec.command;
            }
        }
        hook = r;
    });

    function update() {
        let r = null;
        switch (hook.type) {
            case 'none':
                break;
            case 'cmd':
                r = {
                    exec: {
                        command: hook.command
                    }
                };
                break;
            case 'http':
                r = {
                    httpGet: {
                        host: hook.host,
                        path: hook.path,
                        port: hook.port,
                        scheme: hook.schema,
                        httpHeaders: hook.headers
                    }
                };
                break;
        }
        callback && callback(r);
    }

    function httpCallback(a) {
        hook.path = a.path;
        hook.port = a.port;
        hook.schema = a.schema;
        hook.headers = a.headers;
        hook.host = a.host;
        update();
    }
</script>
<div class="section">
    <div class="sub-title">{label}</div>
    <div class="block colum-1">
        <RadioGroup options={options} bind:value={hook.type} disabled={disabled}/>
    </div>
    {#if hook.type === 'cmd'}
        <div class="block colum-1">
            <Input label="Command" placeholder="echo 'Hello world'" bind:value={hook.command} disabled={disabled}/>
        </div>
    {:else if hook.type === 'http'}
        <HttpSet bind:value={hook} callback={a=>httpCallback(a)} disabled={disabled}/>
    {/if}
</div>