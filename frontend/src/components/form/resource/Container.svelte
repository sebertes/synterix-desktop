<script>
    import Input from "components/form/Input.svelte";
    import ContainerImage from "components/form/resource/ContainerImage.svelte";
    import ContainerPorts from "components/form/resource/ContainerPorts.svelte";
    import ContainerCommand from "components/form/resource/ContainerCommand.svelte";
    import ContainerEnv from "components/form/resource/ContainerEnv.svelte";
    import ContainerResources from "components/form/resource/ContainerResources.svelte";
    import ContainerHealthCheck from "components/form/resource/ContainerHealthCheck.svelte";
    import ContainerLifecycleHook from "components/form/resource/ContainerLifecycleHook.svelte";
    import ContainerSecurityContext from "components/form/resource/ContainerSecurityContext.svelte";
    import VolumeMount from "components/form/resource/VolumeMount.svelte";

    let {value = $bindable({}), yaml, disabled} = $props();

    function setPostStart(a) {
        if (!value.lifecycle) {
            value.lifecycle = {};
        }
        value.postStart = a;
    }

    function setPreStop(a) {
        if (!value.lifecycle) {
            value.lifecycle = {};
        }
        value.preStop = a;
    }
</script>

<div class="section">
    <div class="block colum-2">
        <div class="field">
            <Input label="Container name" bind:value={value.name} disabled={disabled}/>
        </div>
    </div>
    <div class="block colum-1">
        <ContainerImage image={value.image} imagePullPolicy={value.imagePullPolicy}
                        imagePullSecrets={value.imagePullSecrets}
                        callback={a=>Object.assign(value,a)} disabled={disabled}/>
    </div>
    <div class="block colum-1">
        <ContainerPorts value={value.ports} callback={a=>value.ports=a} disabled={disabled}/>
    </div>
    <div class="block colum-1">
        <ContainerCommand command={value.command} args={value.args} workingDir={value.workingDir}
                          stdin={value.stdin} callback={a=>Object.assign(value,a)} disabled={disabled}/>
    </div>
    <div class="block colum-1">
        <ContainerEnv value={value.env} callback={a=>value.env=a} disabled={disabled}/>
    </div>
    <div class="block colum-1">
        <ContainerResources value={value.resources} callback={a=>value.resources=a} disabled={disabled}/>
    </div>
    <ContainerHealthCheck label={"Readiness Check"} value={value.readinessProbe}
                          callback={a=>value.readinessProbe=a} disabled={disabled}/>
    <ContainerHealthCheck label={"Liveness Check"} value={value.livenessProbe}
                          callback={a=>value.livenessProbe=a} disabled={disabled}/>
    <ContainerHealthCheck label={"Startup Check"} value={value.startupProbe} callback={a=>value.startupProbe=a}
                          disabled={disabled}/>
    <ContainerLifecycleHook label={'PostStart'} value={value.lifecycle?.postStart}
                            callback={a=>setPostStart(a)} disabled={disabled}/>
    <ContainerLifecycleHook label={'PreStop'} value={value.lifecycle?.preStop}
                            callback={a=>setPreStop(a)} disabled={disabled}/>
    <div class="title">Security Context</div>
    <ContainerSecurityContext value={value.securityContext} callback={a=>value.securityContext=a} disabled={disabled}/>
    <VolumeMount value={value.volumeMounts} callback={a=>value.volumeMounts=a} disabled={disabled}/>
</div>