export const load = async ({params}) => {
    let clusterPath = params.cluster || "";
    return {
        kind: params.kind || ""
    };
};