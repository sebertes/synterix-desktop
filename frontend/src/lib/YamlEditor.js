import {EditorView, basicSetup} from 'codemirror';
import {yaml} from '@codemirror/lang-yaml';
import {HighlightStyle, syntaxHighlighting} from "@codemirror/language";
import {tags} from "@lezer/highlight";
import yamlLib from 'js-yaml';
import {Compartment} from '@codemirror/state';
import {Utils} from "lib/index.js";

export class YamlEditor {
    constructor({container, content, theme, disabled}) {
        this._container = container;
        this._editor = null;
        this._theme = theme;
        this.disabled = disabled;
        this.themeCompartment = new Compartment();
        this.highlightCompartment = new Compartment();
        if (!content) {
            content = '\n'.repeat(30);
        }
        try {
            this._content = Utils.isString(content) ? content : yamlLib.dump(content);
        } catch (e) {
            this._content = `content conver error`;
        }
    }

    initialize() {
        let t = [];
        if (this.disabled) {
            t.push(EditorView.editable.of(false));
        }
        this._editor = new EditorView({
            doc: this._content,
            extensions: [
                basicSetup,
                yaml(),
                this.themeCompartment.of(this.getTheme()),
                this.highlightCompartment.of(this.getHighlightStyle()),
                ...t
            ],
            parent: this._container
        });
    }

    getTheme(dark = true) {
        return EditorView.theme({
            "&": {
                color: this.getColor('on-surface'),
                backgroundColor: this.getColor("background"),
            },
            ".cm-content": {
                caretColor: this.getColor("primary"),
            },
            ".cm-gutters": {
                backgroundColor: this.getColor("surface-container-low"),
                color: this.getColor("outline-variant"),
                borderRight: `1px solid ${this.getColor("outline-variant")}`,
            },
            ".cm-activeLineGutter": {
                backgroundColor: this.getColor("surface-container-lowest"),
            },
            ".cm-activeLine": {
                backgroundColor: this.getColor("primary-container"),
            },
            "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
                backgroundColor: this.getColor("primary-container"),
            },
        }, {dark});
    }

    getHighlightStyle() {
        return syntaxHighlighting(HighlightStyle.define([
            {tag: tags.propertyName, color: this.getColor("primary")},
            {tag: tags.string, color: this.getColor("success-color")},
            {tag: tags.number, color: this.getColor("info-color")},
            {tag: tags.bool, color: this.getColor("warning-color")},
            {tag: tags.null, color: this.getColor("error")},
            {tag: tags.comment, color: this.getColor("outline-variant"), fontStyle: "italic"},
            {tag: tags.operator, color: this.getColor("secondary")},
            {tag: tags.punctuation, color: this.getColor("outline-variant")},
        ]));
    }

    getColor(colorName) {
        const rootStyles = getComputedStyle(document.body);
        return rootStyles.getPropertyValue(`--${colorName}`).trim();
    }

    setContent(content) {
        if (!content) {
            content = '\n'.repeat(30);
        }
        this._editor && this._editor.dispatch({
            changes: {
                from: 0,
                to: this._editor.state.doc.length,
                insert: Utils.isString(content) ? content : yamlLib.dump(content)
            }
        });
    }

    getContent() {
        return this._editor && this._editor.state.doc.toString().trim();
    }

    toggleTheme(theme) {
        if (theme !== this._theme) {
            this._theme = theme;
            setTimeout(() => {
                this._editor.dispatch({
                    effects: [
                        this.themeCompartment.reconfigure(this.getTheme(this._theme === 'dark')),
                        this.highlightCompartment.reconfigure(this.getHighlightStyle())
                    ],
                });
            });
        }
    }
}