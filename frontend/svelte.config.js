import adapter from '@sveltejs/adapter-static';
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';

const config = {
    kit: {
        adapter: adapter({
            fallback: 'index.html',
        }),
        alias: {
            lib: 'src/lib',
            components: 'src/components',
            store: 'src/store'
        },
        prerender: {
            entries: []
        }
    },
    preprocess: [vitePreprocess()]
};

export default config;
