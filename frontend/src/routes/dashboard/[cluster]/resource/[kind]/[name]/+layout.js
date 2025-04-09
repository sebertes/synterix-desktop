export const load = async ({params, url}) => {
    return {
        action: params.action || url.pathname.split("/")[6] || "detail",
        name: params.name,
        kind: params.kind
    };
};