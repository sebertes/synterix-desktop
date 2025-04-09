import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile, readdir, writeFile} from 'fs/promises';
import colorLib from 'color';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ThemeHelper {
    constructor() {
        this.cssPath = path.join(__dirname, './css');
        this.outputPath = path.join(__dirname, './out');
        this.jsonPath = path.join(__dirname, './material-theme.json');
    }

    async getThemeJson() {
        const json = await readFile(this.jsonPath, 'utf8');
        return JSON.parse(json);
    }

    async output() {
        let themes = [];
        let list = await readdir(this.cssPath);
        for (const fileName of list) {
            let file = path.resolve(this.cssPath, `./${fileName}`);
            let a = path.basename(file).split('.');
            a.pop();
            let themeName = `${a.join('.')}`;
            let content = await readFile(file, 'utf-8');
            let e = content.match(/{([\s\S]+)}/);
            if (e) {
                let theme = {name: themeName, data: {}};
                e[1].split('\n').forEach(a => {
                    a = a.trim();
                    if (a) {
                        let [prop, value] = a.split(':');
                        prop = prop.substring(2).split("-").splice(3).join("-");
                        value = value.substring(0, value.length - 1);
                        theme.data[prop] = value;
                    }
                });
                themes.push(theme);
            }
        }
        // console.log(themes);
        let result = [];
        let themeDef = themes.map(({name, data}) => {
            return `$${name}-theme:(\n${Reflect.ownKeys(data).map(prop => {
                let value = data[prop];
                return `     ${prop}:${value}`;
            }).join(",\n")}\n);\n`;
        });
        result.push(themeDef.join("\n"));
        result.push(`:root {
          @each $key, $value in $dark-theme {
            --#{$key}: #{$value};
          }
        }`);
        result.push(themes.map(({name, data}) => {
            return `[data-theme="${name}"] {
              @each $key, $value in $${name}-theme {
                --#{$key}: #{$value};
              }
            }`
        }).join("\n"));

        const json = await this.getThemeJson();
        const colors = [];
        json.extendedColors.map(({name, color}) => {
            colors.push({name, color});
            colors.push({name: `${name}-darker`, color: colorLib(color).darken(0.1).hex()});
            colors.push({name: `${name}-lighter`, color: colorLib(color).lighten(0.1).hex()});
        });
        result.push(`:root{\n${colors.map(({name, color}) => {
            return `--${name}:${color};\n`;
        }).join("")}}\n`);
        // result.push(Reflect.ownKeys(json.palettes).map(a => {
        //     let value = json.palettes[a];
        //     return Reflect.ownKeys(value).map(b => {
        //         return `$${a}-${b}:${value[b]};`;
        //     }).join("\n");
        // }).join('\n'));
        await writeFile(path.resolve(this.outputPath, './theme.scss'), result.join("\n"));

        let varsResult = [];
        varsResult.push(Reflect.ownKeys(themes[0].data).map(prop => {
            let value = themes[0].data[prop];
            return `$${prop.replace(/-[a-z]/g, str => str.substring(1).toUpperCase())}:var(--${prop});\n`;
        }).join(""));
        varsResult.push(colors.map(({name, color}) => {
            return `$${name}:var(--${name});\n`;
        }).join(""));
        // varsResult.push(Reflect.ownKeys(json.palettes).map(a => {
        //     let value = json.palettes[a];
        //     return Reflect.ownKeys(value).map(b => {
        //         return `$${a}-${b}:var(--${a}-${b});`;
        //     }).join("\n");
        // }).join('\n'));
        await writeFile(path.resolve(this.outputPath, './variables.scss'), varsResult.join("\n"));
    }
}

const helper = new ThemeHelper();
(async () => {
    await helper.output();
})();