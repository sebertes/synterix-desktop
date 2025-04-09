import {Utils} from "lib";

const templates = new Map();

export const ResourceTemplate = {
    async get(kind, type) {
        let key = `${kind}-${type}`;
        if (templates.has(key)) {
            return templates.get(key);
        }
        let path = type ? `/templates/${kind}-${type}.yml` : `/templates/${kind}.yml`;
        let response = await fetch(Utils.fixHost(path), {
            method: "get"
        });
        if (response.ok) {
            let content = await response.text();
            templates.set(key, content);
            return content;
        }
        return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment`;
    }
}