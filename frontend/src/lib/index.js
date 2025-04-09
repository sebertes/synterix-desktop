// place files you want to import through the `$lib` alias in this folder.
export const Utils = {
    getRandomId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },
    isString(value) {
        return Object.prototype.toString.call(value) === '[object String]';
    },
    deepEqual(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (typeof obj1 !== 'object' || obj1 === null ||
            typeof obj2 !== 'object' || obj2 === null) {
            return false;
        }
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (let key of keys1) {
            if (!keys2.includes(key)) return false;
            if (!this.deepEqual(obj1[key], obj2[key])) return false;
        }
        return true;
    },
    copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text).then(() => {
                return true;
            }).catch((error) => {
                console.error("Clipboard API 失败，回退到 execCommand:", error);
                return this.copyByCommand(text);
            });
        } else {
            return this.copyByCommand(text);
        }
    },
    copyByCommand(text) {
        const tempElement = document.createElement("textarea");
        tempElement.value = text;
        tempElement.style.position = "absolute";
        tempElement.style.left = "-9999px";
        document.body.appendChild(tempElement);
        tempElement.select();
        try {
            return document.execCommand("copy");
        } catch (error) {
            console.error("execCommand 错误:", error);
            return false;
        } finally {
            document.body.removeChild(tempElement);
        }
    },
    throttle(func, delay, {leading = false, trailing = true} = {}) {
        let lastTime = 0;
        let timer = null;
        return function (...args) {
            const now = Date.now();
            if (!lastTime && !leading) lastTime = now;
            const remaining = delay - (now - lastTime);
            if (remaining <= 0) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                func.apply(this, args);
                lastTime = now;
            } else if (trailing && !timer) {
                timer = setTimeout(() => {
                    func.apply(this, args);
                    lastTime = leading ? Date.now() : 0;
                    timer = null;
                }, remaining);
            }
        };
    },
    isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    },
    typeToString(value) {
        if (value === null) {
            return '--';
        }
        if (value === undefined) {
            return '--';
        }
        if (Array.isArray(value)) {
            return '[' + value.length + ']';
        }
        if (typeof value === 'object') {
            return '{}';
        }
        if (typeof value === 'function') {
            return value.toString();
        }
        return String(value);
    },
    generateUniqueString(baseString, existingStrings) {
        let newString = baseString;
        let counter = 1;

        while (existingStrings.includes(newString)) {
            newString = `${baseString}${counter}`;
            counter++;
        }

        return newString;
    },
    getBase64SizeInBytes(base64String) {
        if (!base64String) {
            return 0;
        }
        const base64Data = base64String.split(',')[1] || base64String;
        const binaryString = atob(base64Data);
        return binaryString.length;
    },
    downloadAsYAML(content, filename = 'data.yaml') {
        const blob = new Blob([content], {type: 'text/yaml'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.yaml') ? filename : `${filename}.yml`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },
    fixHost(url) {
        return `http://localhost:${window.localStorage.port}${url}`;
    }
}