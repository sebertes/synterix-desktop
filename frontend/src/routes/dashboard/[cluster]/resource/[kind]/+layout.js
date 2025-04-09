export const load = async ({params}) => {
    return {
        name: params.name,
        kind: params.kind
    };
};