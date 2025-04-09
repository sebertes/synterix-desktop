<script>
    import Input from "components/form/Input.svelte";
    import Form from "components/form/Form.svelte";
    import {clusters, optionsProvider, proxies, serviceInvoke, SynterixUtils} from "store/Synterix.svelte.js";
    import Select from "components/form/Select.svelte";
    import RadioGroup from "components/form/RadioGroup.svelte";
    import {page} from "$app/state";
    import CrossIcon from "components/icons/CrossIcon.svelte";
    import CheckIcon from "components/icons/CheckIcon.svelte";
    import PauseIcon from "components/icons/PauseIcon.svelte";
    import ResumeIcon from "components/icons/ResumeIcon.svelte";
    import DownloadIcon from "components/icons/DownloadIcon.svelte";

    let clusterList = $state([]);
    let selectCluster = $state(null);
    let namespaceList = $state([]);
    let selectNamespace = $state(null);
    let serviceList = $state([]);
    let selectService = $state(null);
    let podList = $state([]);
    let selectPod = $state(null);
    let error = $state(false);
    let errorMsg = $state("");
    let form = null;
    let serviceType = $state("service");
    let inputName = $state("");
    let inputDesc = $state("");
    let inputPort = $state();
    let inputTargetHost = $state();
    let inputTargetPort = $state();
    let targetId = $state();
    let status = $state("");
    let params = $derived.by(() => {
        let params = {};
        page.url.search.substring(1).split("&").forEach(a => {
            let [key, value] = a.split('=');
            params[key] = value;
        });
        return params;
    });

    let serviceTypes = [
        {name: "Select a Service", value: "service"},
        {name: "Select a Pod", value: "pod"},
        {name: "Service cluster URL", value: "path"},
        {name: "Use kubectl", value: "kube"}
    ];

    function startProxy() {
        if (params.id) {
            proxies.startProxyServer(params.id);
        }
    }

    function stopProxy() {
        if (params.id) {
            proxies.stopProxyServer(params.id);
        }
    }

    function downloadKubeConfig() {
        if (params.id) {
            proxies.downloadKubeconfig(params.id);
        }
    }

    $effect(() => {
        proxies.keep().done(() => {
            if (params.id) {
                let tt = proxies.getProxy(params.id);
                serviceType = tt.serviceType;
                selectCluster = tt.cluster;
                selectService = tt.service;
                selectPod = tt.pod;
                selectNamespace = tt.namespace;
                inputName = tt.name;
                inputDesc = tt.description;
                inputPort = tt.localPort;
                inputTargetHost = tt.target?.host;
                inputTargetPort = tt.target?.port;
                targetId = params.id;
                status = tt.status;
            }
        });
    })
    $effect(() => {
        SynterixUtils.keep(clusters).done(() => {
            clusterList = clusters.data.map(a => {
                return {
                    name: a.name,
                    value: a.clusterId,
                    type: a.type
                };
            });
        });
    });
    $effect(async () => {
        if (selectCluster) {
            let {code, body} = await serviceInvoke.post({
                edgeId: selectCluster === 'central' ? null : selectCluster,
                serviceName: 'synterix-kube-proxy',
                path: "/kube/resource/Namespace",
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                body: "{}"
            });
            if (code === 0) {
                let {code, data} = JSON.parse(body);
                if (code === 0) {
                    namespaceList = data.map(a => {
                        return {
                            name: a.metadata.name,
                            value: a.metadata.name
                        }
                    });
                    if (namespaceList.length > 0) {
                        selectNamespace = namespaceList[0].value;
                    }
                }
            }
        }
    });
    $effect(async () => {
        if (selectNamespace) {
            let {code, body} = await serviceInvoke.post({
                edgeId: selectCluster === 'central' ? null : selectCluster,
                serviceName: 'synterix-kube-proxy',
                path: "/kube/resource/Service",
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify({
                    namespace: selectNamespace
                })
            });
            if (code === 0) {
                let {code, data} = JSON.parse(body);
                if (code === 0) {
                    serviceList = data.map(a => {
                        return {
                            name: a.metadata.name,
                            value: a.metadata.name,
                            data: {
                                host: a.spec.clusterIP,
                                port: a.spec.ports?.[0].port,
                            }
                        }
                    });
                    if (serviceList.length > 0) {
                        selectService = serviceList[0].value;
                    }
                }
            }
        }
    });
    $effect(async () => {
        if (selectNamespace) {
            let {code, body} = await serviceInvoke.post({
                edgeId: selectCluster === 'central' ? null : selectCluster,
                serviceName: 'synterix-kube-proxy',
                path: "/kube/resource/Pod",
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify({
                    namespace: selectNamespace
                })
            });
            if (code === 0) {
                let {code, data} = JSON.parse(body);
                if (code === 0) {
                    podList = data.map(a => {
                        return {
                            name: a.metadata.name,
                            value: a.metadata.name,
                            data: {
                                host: a.status.podIP,
                                port: a.spec.containers?.[0].ports?.[0].containerPort,
                            }
                        }
                    });
                    if (podList.length > 0) {
                        selectPod = podList[0].value;
                    }
                }
            }
        }
    })
</script>

<div class="top">
    <Form bind:this={form}>
        <div class="title">
            <a href="/dashboard">Home:</a>
            Local Proxy
            {#if status}
                <div class={['status-text',status==="Running"?"status-active":"status-failed"]}>{status}</div>
            {/if}
        </div>
        <div class="line"></div>
        <div class="section">
            <div class="sub-title">Basic info</div>
            <div class="block colum-3">
                <Input name="name"
                       label="Name"
                       placeholder="input username"
                       disabled={true}
                       bind:value={inputName}/>
                <Input name="localPort"
                       label="Local Port"
                       type="number"
                       placeholder="input local port"
                       disabled={true}
                       bind:value={inputPort}/>
                <Input name="description"
                       label="Description"
                       placeholder="input description"
                       disabled={true}
                       bind:value={inputDesc}/>
            </div>
        </div>
        <div class="section">
            <div class="sub-title">Service Type</div>
            <div class="block colum-1">
                <RadioGroup options={serviceTypes}
                            label="Service Type"
                            bind:value={serviceType}
                            direct="h"
                            disabled={true}
                            name="serviceType"/>
            </div>
        </div>
        <div class="section">
            <div class="sub-title">Select service</div>
            <div class="block colum-3">
                <Select name="cluster" label="Cluster"
                        placeholder="select a cluster"
                        options={clusterList}
                        bind:value={selectCluster} disabled={true}></Select>
                {#if serviceType !== 'kube'}
                    {#if serviceType === 'path'}
                        <Input name="host" label="Host"
                               placeholder="input host"
                               bind:value={inputTargetHost}
                               disabled={true}/>
                        <Input name="port" label="Port"
                               placeholder="input port"
                               bind:value={inputTargetPort}
                               disabled={true}/>
                    {:else}
                        <Select name="namespace" label="Namespace"
                                placeholder="input username"
                                options={namespaceList}
                                bind:value={selectNamespace}
                                disabled={true}></Select>
                        {#if serviceType === 'service'}
                            <Select name="service" label="Service"
                                    placeholder="input username"
                                    options={serviceList}
                                    bind:value={selectService} disabled={true}></Select>
                        {:else}
                            <Select name="pod" label="Pod" placeholder="input username"
                                    options={podList}
                                    bind:value={selectPod} disabled={true}></Select>
                        {/if}
                    {/if}
                {/if}
            </div>
        </div>
        {#if error}
            <div class="banner error">{errorMsg}</div>
        {/if}
    </Form>
    <div class="buttons">
        <div class="btn-group">
            {#if status}
                {#if status === 'Running'}
                    <button class="btn" onclick={()=>stopProxy()}>
                        <PauseIcon/>
                        Stop
                    </button>
                {:else}
                    <button class="btn" onclick={()=>startProxy()}>
                        <ResumeIcon/>
                        Start
                    </button>
                {/if}
            {/if}
            {#if serviceType === 'kube'}
                <button class="btn" onclick={()=>downloadKubeConfig()}>
                    <DownloadIcon/>
                    Download Kubeconfig
                </button>
            {/if}
            <a class="btn" href="/dashboard">
                <CrossIcon/>
                Cancel
            </a>
        </div>
    </div>
</div>

<style lang="scss">
  .top {
    padding: 30px 80px 30px 80px;
  }

  .title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .sub-title {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .line {
    height: 1px;
    background: $outlineVariant;
    margin: 20px 0 20px 0;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .buttons {
    text-align: right;
  }

  .status-text {
    line-height: 30px;
    margin-left: 5px;
    font-size: 16px;
  }

</style>