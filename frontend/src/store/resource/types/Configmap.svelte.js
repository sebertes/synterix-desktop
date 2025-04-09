import {Resource} from "store/resource/Resource.svelte.js";
import ResourceRefers from "components/resource/ResourceRefers.svelte";
import Metadata from "components/form/resource/Metadata.svelte";
import ConfigmapData from "components/form/resource/ConfigmapData.svelte";
import ConfigmapBinaryData from "components/form/resource/ConfigmapBinaryData.svelte";
import ConfigmapDetail from "components/ConfigmapDetail.svelte";

export class Configmap extends Resource {
    constructor(raw, resourceKinds) {
        super(raw, resourceKinds);
    }

    getTableRow() {
        let configMap = this.raw;
        return {
            id: configMap.metadata.name,
            name: configMap.metadata.name,
            namespace: configMap.metadata.namespace,
            data: Object.keys(configMap.data || {}).join(', '),
            age: this.age
        };
    }

    getTableHeader() {
        return [
            {name: "Name", key: "name", align: 'left', sortable: true, sorted: "asc"},
            {name: "Namespace", key: "namespace", align: 'left'},
            {name: "Data", key: "data", align: 'left', sortable: true},
            {name: "Age", key: "age", align: 'right', sortable: true}
        ];
    }

    getIntro(resource) {
        return [];
    }

    getDetailTabs(configmap) {
        return [
            {
                id: "data",
                title: "Data",
                component: ConfigmapDetail,
                params: {
                    configmap
                }
            },
            {
                id: "refers",
                title: "Related Resources",
                component: ResourceRefers,
                params: {
                    name: configmap.metadata.name,
                    namespace: configmap.metadata.namespace,
                    kind: configmap.kind,
                }
            }
        ];
    }

    getFormDefinition() {
        return [
            {
                name: "metadata",
                component: Metadata,
                key: "metadata",
                option: {label: 'metadata'},
            },
            {
                name: "data", component: ConfigmapData, key: "data", defaultValue() {
                    return []
                }
            },
            {
                name: "binaryData", component: ConfigmapBinaryData, key: "binaryData", defaultValue() {
                    return []
                }
            },
        ];
    }
}