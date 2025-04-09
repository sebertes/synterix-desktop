import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        level: 'silent',
        proxy: {
            '/kube': {
                target: 'https://yuntuops-test.bjttsx.com',
                changeOrigin: true,
                ws: true,
            },
            '/synterix': {
                target: 'https://yuntuops.bjttsx.com',
                changeOrigin: true,
                ws: true,
            }
        }
    },
    css: {
        preprocessorOptions: {
            sass: {
                api: 'modern',
                additionalData: `@use '$lib/variables' as *;`,
            },
            scss: {
                api: 'modern',
                additionalData: `@use '$lib/variables' as *;`,
            }
        },
    }
});
