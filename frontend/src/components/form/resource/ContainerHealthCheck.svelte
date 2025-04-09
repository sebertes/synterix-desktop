<script>
    import Select from "components/form/Select.svelte";
    import Input from "components/form/Input.svelte";
    import NameValue from "components/form/resource/NameValue.svelte";

    let {value, label, callback,disabled} = $props();
    let check = $state({type: 'none'});
    let types = [
        {name: "None", value: 'none'},
        {name: "HTTP request returns a successful status (200-399)", value: 'httpGet'},
        {name: "TCP connection opens successfully", value: 'tcpSocket'},
        {name: "Command run inside the container exits with status 0", value: 'command'}
    ];
    let schemas = [
        {name: "HTTPS", value: 'HTTPS'},
        {name: "HTTP", value: 'HTTP'}
    ];
    $effect(() => {
        let r = {
            periodSeconds: null,
            initialDelaySeconds: null,
            timeoutSeconds: null,
            successThreshold: null,
            failureThreshold: null,
        };
        if (!value) {
            r.type = 'none';
            r.path = null;
            r.port = null;
            r.schema = null;
            r.headers = null;
            r.command = null;
        } else {
            r.initialDelaySeconds = value.initialDelaySeconds;
            r.periodSeconds = value.periodSeconds;
            r.timeoutSeconds = value.timeoutSeconds;
            r.successThreshold = value.successThreshold;
            r.failureThreshold = value.failureThreshold;
            if (value.httpGet) {
                r.type = 'httpGet';
                r.path = value.httpGet.path;
                r.port = value.httpGet.port;
                r.schema = value.httpGet.scheme || 'HTTP';
                r.headers = value.httpGet.httpHeaders;
                r.command = null;
            } else if (value.tcpSocket) {
                r.type = 'tcpSocket';
                r.port = value.tcpSocket.port;
                r.path = null;
                r.schema = null;
                r.headers = null;
                r.command = null;
            } else if (value.exec) {
                r.type = 'command';
                r.command = value.exec.command;
                r.path = null;
                r.port = null;
                r.schema = null;
                r.headers = null;
            } else {
                r.type = 'none';
                r.path = null;
                r.port = null;
                r.schema = null;
                r.headers = null;
                r.command = null;
            }
        }
        check = r;
    });

    function update() {
        let r = null;
        if (check.type === 'httpGet') {
            r = {
                httpGet: {
                    path: check.path,
                    port: check.port,
                    scheme: check.schema,
                    httpHeaders: check.headers
                },
                periodSeconds: check.periodSeconds,
                initialDelaySeconds: check.initialDelaySeconds,
                timeoutSeconds: check.timeoutSeconds,
                successThreshold: check.successThreshold,
                failureThreshold: check.failureThreshold
            };
        } else if (check.type === 'tcpSocket') {
            r = {
                tcpSocket: {
                    port: check.port
                },
                periodSeconds: check.periodSeconds,
                initialDelaySeconds: check.initialDelaySeconds,
                timeoutSeconds: check.timeoutSeconds,
                successThreshold: check.successThreshold,
                failureThreshold: check.failureThreshold
            }
        } else if (check.type === 'command') {
            r = {
                exec: {
                    command: check.command
                },
                periodSeconds: check.periodSeconds,
                initialDelaySeconds: check.initialDelaySeconds,
                timeoutSeconds: check.timeoutSeconds,
                successThreshold: check.successThreshold,
                failureThreshold: check.failureThreshold
            }
        }
        callback && callback(r);
    }
</script>
<div class="section">
    <div class="title">{label}</div>
    <div class="block">
        <div class="field">
            <div class="block colum-1">
                <Select label="Type" options={types} bind:value={check.type} disabled={disabled}/>
            </div>
            {#if ['httpGet'].includes(check.type)}
                <div class="block colum-2">
                    <Select label="Schema" options={schemas} bind:value={check.schema} disabled={disabled}/>
                    <Input type="number" placeholder="Port" label="Port" bind:value={check.port} disabled={disabled}/>
                </div>
            {/if}
            {#if ['tcpSocket'].includes(check.type)}
                <div class="block colum-1">
                    <Input type="number" placeholder="Port" label="Port" bind:value={check.port} disabled={disabled}/>
                </div>
            {/if}
            {#if ['command'].includes(check.type)}
                <div class="block colum-1">
                    <Input type="text" placeholder="Command to run" label="Command" bind:value={check.command} disabled={disabled}/>
                </div>
            {/if}
            {#if ['httpGet'].includes(check.type)}
                <div class="block colum-1">
                    <Input type="text" placeholder="Path" label="Path" bind:value={check.path} disabled={disabled}/>
                </div>
            {/if}
        </div>

        <div class="others">
            {#if check.type !== 'none'}
                <div class="block colum-3">
                    <div class="field">
                        <Input placeholder="InitialDelaySeconds" label="InitialDelaySeconds"
                               value={check.initialDelaySeconds} type="number"
                               unit="Sec" disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Input placeholder="PeriodSeconds" label="PeriodSeconds" value={check.periodSeconds}
                               type="number" unit="Sec" disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Input placeholder="TimeoutSeconds" label="TimeoutSeconds" value={check.timeoutSeconds}
                               type="number" unit="Sec" disabled={disabled}/>
                    </div>
                </div>
                <div class="block colum-2">
                    <div class="field">
                        <Input type="number" placeholder="SuccessThreshold" label="SuccessThreshold"
                               value={check.successThreshold} disabled={disabled}/>
                    </div>
                    <div class="field">
                        <Input type="number" placeholder="FailureThreshold" label="FailureThreshold"
                               value={check.failureThreshold} disabled={disabled}/>
                    </div>
                </div>
            {/if}
            {#if ['httpGet'].includes(check.type)}
                <NameValue label="Request Headers" value={check.headers} callback={v=>(check.headers=v)&&update()} disabled={disabled}/>
            {/if}
        </div>
    </div>
</div>