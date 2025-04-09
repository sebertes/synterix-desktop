<script>
    import Input from "components/form/Input.svelte";
    import ContainerImage from "components/form/resource/ContainerImage.svelte";
    import ContainerCommand from "components/form/resource/ContainerCommand.svelte";
    import ContainerEnv from "components/form/resource/ContainerEnv.svelte";
    import ContainerResources from "components/form/resource/ContainerResources.svelte";
    import ContainerSecurityContext from "components/form/resource/ContainerSecurityContext.svelte";
    import VolumeMount from "components/form/resource/VolumeMount.svelte";

    let {value = $bindable({}), yaml, disabled} = $props();
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
        <ContainerCommand command={value.command} args={value.args} workingDir={value.workingDir}
                          stdin={value.stdin} callback={a=>Object.assign(value,a)} disabled={disabled}/>
    </div>
    <div class="block colum-1">
        <ContainerEnv value={value.env} callback={a=>value.env=a} disabled={disabled}/>
    </div>
    <div class="block colum-1">
        <ContainerResources value={value.resources} callback={a=>value.resources=a} disabled={disabled}/>
    </div>
    <div class="title">Security Context</div>
    <ContainerSecurityContext value={value.securityContext} callback={a=>value.securityContext=a} disabled={disabled}/>
    <VolumeMount value={value.volumeMounts} callback={a=>value.volumeMounts=a} disabled={disabled}/>
</div>