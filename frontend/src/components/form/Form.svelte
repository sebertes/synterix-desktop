<script>
    import {setContext} from "svelte";

    let {children} = $props();

    let fields = $state([]);
    setContext("form", fields);

    export function validate() {
        let next = true, msg = null;
        return fields.reduce((a, field) => {
            return a.then(() => {
                if (!next) {
                    return Promise.resolve();
                }
                return Promise.resolve().then(() => field.validate()).then(({result, message}) => {
                    if (!result) {
                        next = false;
                        msg = message;
                    }
                });
            });
        }, Promise.resolve()).then(() => {
            return {result: next, message: msg};
        });
    }

    export function getValue() {
        let result = {};
        return fields.reduce((a, field) => {
            return a.then(() => {
                return Promise.resolve().then(() => field.getValue()).then(value => {
                    result[field.getName()] = value;
                });
            });
        }, Promise.resolve()).then(() => result);
    }
</script>

{@render children?.()}
