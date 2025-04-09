import Big from "big.js";

export const KubeUtils = {
    formatAge(timestamp) {
        const now = new Date();
        const createdAt = new Date(timestamp);
        const diffInSeconds = Math.floor((now - createdAt) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds}s`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)} min`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)} hours`;
        } else { // 30 天
            return `${Math.floor(diffInSeconds / 86400)} days`;
        }
    },
    unitConvert: {
        cpu: {
            parse: (value) => {
                if (!value) return 0;
                const units = {
                    'n': new Big('1e-9'),
                    'u': new Big('0.000001'),
                    'm': new Big('0.001'),
                    '': new Big(1)
                };
                const match = value.match(/([\d.]+)(\D*)/);
                if (!match) return 0;
                try {
                    const valueBig = new Big(match[1]);
                    const unit = units[match[2]] || new Big(1);
                    return parseFloat(valueBig.times(unit).toString());
                } catch (e) {
                    return 0;
                }
            }
        },
        memory: {
            parse: (value) => {
                if (!value) return 0;
                const units = {
                    'Ki': new Big(1).div(1024).div(1024),
                    'Mi': new Big(1).div(1024),
                    'Gi': new Big(1),
                    'Ti': new Big(1024)
                };
                const match = value.match(/([\d.]+)(\D*)/);
                if (!match) return 0;
                try {
                    const valueBig = new Big(match[1]);
                    const unit = units[match[2]] || new Big(1).div(new Big(1024).pow(3));
                    return parseFloat(valueBig.times(unit).toString());
                } catch (e) {
                    return 0;
                }
            }
        },
        format: (value) => {
            return new Big(value).toFixed(2);
        }
    },
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    matchLabels(matchLabels, selector) {
        return Object.keys(matchLabels).every(key => {
            return selector[key] === matchLabels[key];
        });
    },
    filterBySelector(deployments = [], selector) {
        return deployments.filter(a => {
            return this.matchLabels(a.spec.selector.matchLabels, selector);
        });
    },
}