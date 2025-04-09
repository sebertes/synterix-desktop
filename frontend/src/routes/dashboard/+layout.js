export const load = async ({params}) => {
    let clusterPath = params.cluster || "";
    return {
        cluster: {
            proxyType: clusterPath === 'central' ? 'central' : 'edge',
            edgeId: clusterPath === 'central' ? null : clusterPath
        },
        clusterPath: params.cluster
    };
};