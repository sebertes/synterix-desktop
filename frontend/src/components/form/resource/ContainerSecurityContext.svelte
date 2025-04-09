<script>
    import Input from "components/form/Input.svelte";
    import RadioGroup from "components/form/RadioGroup.svelte";
    import MultipeSelect from "components/form/MultipeSelect.svelte";

    let {value, callback, disabled} = $props();
    let securityContext = $state({
        privileged: false,
        runAsNonRoot: false,
        readOnlyRootFilesystem: false,
        allowPrivilegeEscalation: false,
        runAsUser: null,
        runAsGroup: null,
        capabilities_add: null,
        capabilities_drop: null
    });

    let privilegedOptions = [
        {name: "No", value: false},
        {name: "Yes: container has full access to the host", value: true}
    ];
    let privilegeEscalationOptions = [
        {name: "No", value: false},
        {name: "Yes: container can gain more privileges than its parent process", value: true}
    ];
    let runasNonRootOptions = [
        {name: "No", value: false},
        {name: "Yes: container must run as a non-root user", value: true}
    ];
    let readOnlyRootFilesystemOptions = [
        {name: "No", value: false},
        {name: "Yes: container has a read-only root filesystem", value: true}
    ];
    let capabilities = [
        {name: "ALL", value: "ALL"},
        {name: "NET_ADMIN", value: "NET_ADMIN"},
        {name: "SYS_TIME", value: "SYS_TIME"},
        {name: "SYS_MODULE", value: "SYS_MODULE"},
        {name: "DAC_OVERRIDE", value: "DAC_OVERRIDE"},
        {name: "CHOWN", value: "CHOWN"},
        {name: "KILL", value: "KILL"},
        {name: "AUDIT_WRITE", value: "AUDIT_WRITE"},
        {name: "SETPCAP", value: "SETPCAP"},
    ]

    $effect(() => {
        if (value) {
            let r = {};
            r.privileged = value.privileged;
            r.runAsNonRoot = value.runAsNonRoot;
            r.readOnlyRootFilesystem = value.readOnlyRootFilesystem;
            r.allowPrivilegeEscalation = value.allowPrivilegeEscalation;
            r.runAsUser = value.runAsUser;
            r.runAsGroup = value.runAsGroup;
            r.capabilities_add = value.capabilities?.add || [];
            r.capabilities_drop = value.capabilities?.drop || [];
            securityContext = r;
        }
    });

    function update() {
        let r = {}
        r.privileged = securityContext.privileged;
        r.runAsNonRoot = securityContext.runAsNonRoot;
        r.readOnlyRootFilesystem = securityContext.readOnlyRootFilesystem;
        r.allowPrivilegeEscalation = securityContext.allowPrivilegeEscalation;
        r.runAsUser = securityContext.runAsUser;
        r.runAsGroup = securityContext.runAsGroup;
        r.capabilities = {
            add: securityContext.capabilities_add,
            drop: securityContext.capabilities_drop
        }
        callback && callback(r);
    }
</script>

<div class="section">
    <div class="block">
        <div class="field">
            <div class="title">Privileged</div>
            <RadioGroup label="Privileged" options={privilegedOptions} bind:value={securityContext.privileged}
                        callback={update} disabled={disabled}/>
        </div>
        <div class="field">
            <div class="title">Privilege Escalation</div>
            <RadioGroup label="Privilege Escalation" options={privilegeEscalationOptions}
                        bind:value={securityContext.allowPrivilegeEscalation} callback={update} disabled={disabled}/>
        </div>
    </div>
    <div class="block">
        <div class="field">
            <div class="title">Run as Non-Root</div>
            <RadioGroup label="Run as Non-Root" options={runasNonRootOptions}
                        bind:value={securityContext.runAsNonRoot} callback={update} disabled={disabled}/>
        </div>
        <div class="field">
            <div class="title">Read-Only Root Filesystem</div>
            <RadioGroup label="Read Only Root Filesystem" options={readOnlyRootFilesystemOptions}
                        bind:value={securityContext.readOnlyRootFilesystem} callback={update} disabled={disabled}/>
        </div>
    </div>
    <div class="block">
        <div class="field">
            <Input label="Run as User Id" bind:value={securityContext.runAsUser} onblur={update} disabled={disabled}/>
        </div>
        <div class="field">
            <Input label="Run as Group Id" bind:value={securityContext.runAsGroup} onblur={update} disabled={disabled}/>
        </div>
    </div>
    <div class="block">
        <div class="field">
            <MultipeSelect label="capabilities.add" options={capabilities} bind:value={securityContext.capabilities_add}
                           onClose={update} disabled={disabled}/>
        </div>
        <div class="field">
            <MultipeSelect label="capabilities.drop" options={capabilities}
                           bind:value={securityContext.capabilities_drop}
                           onClose={update} disabled={disabled}/>
        </div>
    </div>
</div>