const localeMap = {
    en: {
        label: "English",
        map: {
            "home": "Home",
            "edgeCluster": "Edge Cluster",
            "configuration": "Configuration",
            "users": "Users",
            "apiKeys": "Api Keys",
            "setting": "Setting",
        }
    },
    cn: {
        label: "简体中文",
        map: {
            "home": "首页",
            "edgeCluster": "边缘集群",
            "configuration": "应用配置",
            "users": "用户管理",
            "apiKeys": "接口Keys",
            "setting": "全局设置",
        }
    }
};

class Locale {
    type = $state("en");
    map = $state(localeMap["en"].map);
    label = $state(localeMap["en"].label);

    setLocale(type) {
        this.type = type || this.type;
        this.map = localeMap[type].map;
        this.label = localeMap[type].label;
    }

    getLocaleMap() {
        return Reflect.ownKeys(localeMap).map(a => {
            return {key: a, label: localeMap[a].label};
        });
    }
}

export const locale = new Locale();