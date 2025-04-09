export const load = async ({params, route}) => {
    let page = route.id.split('/').pop();
    return {
        page: page === '[slug]' ? "/" : page,
        slug: params.slug,
    }
}