import ShellIcon from "components/icons/ShellIcon.svelte";
import RefreshIcon from "components/icons/RefreshIcon.svelte";
import RollbackIcon from "components/icons/RollbackIcon.svelte";
import PauseIcon from "components/icons/PauseIcon.svelte";
import EditIcon from "components/icons/EditIcon.svelte";
import CloneIcon from "components/icons/CloneIcon.svelte";
import DownloadIcon from "components/icons/DownloadIcon.svelte";
import DeleteIcon from "components/icons/DeleteIcon.svelte";
import JSZip from "jszip";
import yamlLib from "js-yaml";
import LogIcon from "components/icons/LogIcon.svelte";
import ProxyIcon from "components/icons/ProxyIcon.svelte";

const Actions = {
    ExecuteShell: {
        label: 'Execute Shell',
        icon: ShellIcon,
        type: 'active',
        category: "shell",
        sort: 0
    },
    ViewLog: {
        label: 'View Logs',
        icon: LogIcon,
        type: 'active',
        category: "shell",
        sort: 0
    },
    Redeploy: {
        label: 'Redeploy',
        icon: RefreshIcon,
        type: 'active',
        category: "workload",
        sort: 1
    },
    Rollback: {
        label: 'Rollback',
        icon: RollbackIcon,
        type: 'active',
        category: "workload",
        sort: 1
    },
    Orchestration: {
        label: 'Pause Orchestration',
        icon: PauseIcon,
        type: 'active',
        category: "workload",
        sort: 1
    },
    EditConfig: {
        label: 'Edit Config',
        icon: EditIcon,
        type: 'active',
        category: "yaml",
        sort: 2
    },
    ViewConfig: {
        label: 'View Config',
        icon: EditIcon,
        type: 'active',
        category: "yaml",
        sort: 2
    },
    ViewYaml: {
        label: 'View Yaml',
        icon: EditIcon,
        type: 'active',
        category: "yaml",
        sort: 2
    },
    EditYaml: {
        label: 'Edit Yaml',
        icon: EditIcon,
        type: 'active',
        category: "yaml",
        sort: 2
    },
    Clone: {
        label: 'Clone',
        icon: CloneIcon,
        type: 'active',
        category: "yaml",
        sort: 2
    },
    CloneYaml: {
        label: 'Clone',
        icon: CloneIcon,
        type: 'active',
        category: "yaml",
        sort: 2
    },
    Download: {
        label: 'Download Yaml',
        icon: DownloadIcon,
        type: 'active',
        category: "util",
        sort: 3
    },
    Delete: {
        label: 'Delete',
        icon: DeleteIcon,
        type: 'active',
        category: "util",
        sort: 3
    },
    Proxy: {
        label: 'Set Proxy',
        icon: ProxyIcon,
        type: 'active',
        category: "util",
        sort: 3
    }
};

const ActionPages = {
    Detail: {path: "detail"},
    Yaml: {path: "yaml"},
    Config: {path: "config"}
};

const TableMenus = {
    ExecuteShell(resourceHandler) {
        return {
            ...Actions.ExecuteShell,
            action: async (name) => {
                resourceHandler.executeShell(name);
            }
        }
    },
    ViewLog(resourceHandler) {
        return {
            ...Actions.ViewLog,
            action: async (podName) => {
                resourceHandler.viewLog(podName);
            }
        };
    },
    Redeploy(resourceHandler) {
        return {
            ...Actions.Redeploy,
            action: async (name) => {
                await resourceHandler.redeploy(name);
            }
        }
    },
    Rollback(resourceHandler) {
        return {
            ...Actions.Rollback,
            action: async (name) => {
                resourceHandler.rollback(name);
            }
        }
    },
    Orchestration(resourceHandler) {
        return {
            ...Actions.Orchestration,
            action: async (name) => {
                resourceHandler.pauseOrchestration(name);
            }
        }
    },
    EditConfig(resourceHandler) {
        return {
            ...Actions.EditConfig,
            action: async (name) => {
                resourceHandler.gotoLink(name, 'edit');
            }
        }
    },
    ViewConfig(resourceHandler) {
        return {
            ...Actions.ViewConfig,
            action: async (name) => {
                resourceHandler.gotoLink(name, 'config');
            }
        }
    },
    ViewYaml(resourceHandler) {
        return {
            ...Actions.ViewYaml,
            action: async (name) => {
                resourceHandler.gotoLink(name, 'yaml');
            }
        }
    },
    EditYaml(resourceHandler) {
        return {
            ...Actions.EditYaml,
            action: async (name) => {
                resourceHandler.gotoLink(name, 'yamle');
            }
        };
    },
    Clone(resourceHandler) {
        return {
            ...Actions.Clone,
            action: async (name) => {
                resourceHandler.gotoLink(name, 'clone');
            }
        }
    },
    CloneYaml(resourceHandler) {
        return {
            ...Actions.CloneYaml,
            action: async (name) => {
                resourceHandler.gotoLink(name, 'cloneYaml');
            }
        }
    },
    Download(resourceHandler) {
        return {
            ...Actions.Download,
            action: (name) => {
                resourceHandler.download(name);
            }
        }
    },
    Delete(resourceHandler) {
        return {
            ...Actions.Delete,
            action: (name) => {
                resourceHandler.delete(name);
            }
        }
    },
    Proxy(resourceHandler) {
        return {
            ...Actions.Proxy,
            action: (name) => {
                resourceHandler.setProxy(name);
            }
        }
    }
};

const DetailDropMenus = {
    ExecuteShell(resourceHandler, resource) {
        return {
            ...Actions.ExecuteShell,
            action: async () => {
                resourceHandler.executeShell(resource.metadata.name);
            }
        }
    },
    ViewLog(resourceHandler, resource) {
        return {
            ...Actions.ViewLog,
            action: async () => {
                resourceHandler.viewLog(resource.metadata.name);
            }
        };
    },
    Redeploy(resourceHandler, resource) {
        return {
            ...Actions.Redeploy,
            action: async () => {
                resourceHandler.redeploy(resource.metadata.name);
            }
        }
    },
    Rollback(resourceHandler, resource) {
        return {
            ...Actions.Rollback,
            action: async () => {
                resourceHandler.rollback(resource.metadata.name);
            }
        }
    },
    Orchestration(resourceHandler, resource) {
        return {
            ...Actions.Orchestration,
            action: async (name) => {
                resourceHandler.pauseOrchestration(resource.metadata.name);
            }
        }
    },
    EditConfig(resourceHandler, resource) {
        return {
            ...Actions.EditConfig,
            action: async () => {
                resourceHandler.gotoLink(resource.metadata.name, 'edit');
            }
        }
    },
    EditYaml(resourceHandler, resource) {
        return {
            ...Actions.EditYaml,
            action: async (name) => {
                resourceHandler.gotoLink(resource.metadata.name, 'yamle');
            }
        };
    },
    ViewYaml(resourceHandler, resource) {
        return {
            ...Actions.ViewYaml,
            action: async (name) => {
                resourceHandler.gotoLink(resource.metadata.name, 'yaml');
            }
        };
    },
    ViewConfig(resourceHandler, resource) {
        return {
            ...Actions.ViewConfig,
            action: async (name) => {
                resourceHandler.gotoLink(resource.metadata.name, 'config');
            }
        };
    },
    Clone(resourceHandler, resource) {
        return {
            ...Actions.Clone,
            action: async () => {
                resourceHandler.gotoLink(resource.metadata.name, 'clone');
            }
        }
    },
    CloneYaml(resourceHandler, resource) {
        return {
            ...Actions.CloneYaml,
            action: async () => {
                resourceHandler.gotoLink(resource.metadata.name, 'cloneYaml');
            }
        }
    },
    Download(resourceHandler, resource) {
        return {
            ...Actions.Download,
            action: () => {
                resourceHandler.download(resource.metadata.name);
            }
        }
    },
    Delete(resourceHandler, resource) {
        return {
            ...Actions.Delete,
            action: () => {
                resourceHandler.delete(resource.metadata.name);
            }
        }
    },
    Proxy(resourceHandler, resource) {
        return {
            ...Actions.Proxy,
            action: () => {
                resourceHandler.setProxy(resource.metadata.name);
            }
        }
    }
}

const TableButtons = {
    Redeploy(resourceHandler) {
        return {
            ...Actions.Redeploy,
            action: (ids) => {
                resourceHandler.getResources(ids).forEach(a => {
                    resourceHandler.redeploy(a.metadata.name);
                });
            }
        };
    },
    Download(resourceHandler) {
        return {
            ...Actions.Download,
            action: async (ids) => {
                const zip = new JSZip();
                let list = resourceHandler.getResources(ids);
                list.map(a => {
                    return {name: `${a.metadata.name}.yaml`, content: yamlLib.dump(a)};
                }).forEach(file => {
                    zip.file(file.name, file.content);
                });
                const content = await zip.generateAsync({type: 'blob'});
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'resources.zip';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 0);
            }
        }
    },
    Delete(resourceHandler) {
        return {
            ...Actions.Delete,
            action: (ids) => {
                resourceHandler.getResources(ids).forEach(a => {
                    resourceHandler.delete(a.metadata.name);
                });
            }
        }
    }
}

export const ConfigProvider = {
    getTableMenus(resourceHandler, actions = []) {
        let map = {};
        actions.filter(a => !!TableMenus[a]).map(a => {
            return {...TableMenus[a](resourceHandler), typeName: a};
        }).forEach(a => {
            if (!map[a.sort]) {
                map[a.sort] = [];
            }
            map[a.sort].push(a);
        });
        let list = [];
        Reflect.ownKeys(map).forEach(sort => {
            list.push(...map[sort]);
            list.push({type: 'line'});
        })
        if (list.length > 0) {
            list.pop();
        }
        return list;
    },
    getDetailDropMenus(resourceHandler, resource, actions = []) {
        let map = {};
        actions.filter(a => !!DetailDropMenus[a]).map(a => {
            return {...DetailDropMenus[a](resourceHandler, resource), typeName: a};
        }).forEach(a => {
            if (!map[a.sort]) {
                map[a.sort] = [];
            }
            map[a.sort].push(a);
        });
        let list = [];
        Reflect.ownKeys(map).forEach(sort => {
            list.push(...map[sort]);
            list.push({type: 'line'});
        })
        if (list.length > 0) {
            list.pop();
        }
        return list;
    },
    getTableButtons(resourceHandler, actions = []) {
        return actions.filter(a => !!TableButtons[a]).map(a => {
            return {...TableButtons[a](resourceHandler), typeName: a};
        });
    },
    getActionPages(actions = []) {
        return actions.filter(a => !!ActionPages[a]).map(a => {
            return {...ActionPages[a], name: a};
        })
    }
}