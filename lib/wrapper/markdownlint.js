/**
 * @module wrapper/markdownlint
 * @see {@link https://www.npmjs.com/package/markdownlint|Markdownlint}
 */

"use strict";

const fs           = require("fs");
const markdownlint = require("markdownlint");
const SEVERITY     = require("../severity");

/**
 * Initialise un checker pour Markdownlint en cherchant l'éventuelle
 * configuration.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of fs.readdirSync(".")) {
        if ([".markdownlint.json", ".markdownlintrc"].includes(file)) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": "*.md",
        "linters":  { "markdownlint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>MarkdownLint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        const config = {
            "files":  file,
            "config": options
        };
        markdownlint(config, (_, results) => resolve(results));
    }).then(function (results) {
        if ("" === results.toString()) {
            return [];
        }

        return results.toString().split("\n").map(function (result) {
            const parts = result.match(/[^ ]+ (\d+): ([^ ]+) (.*)/u);
            return {
                "file":      file,
                "linter":    "markdownlint",
                "rule":      parts[2],
                "message":   parts[3],
                "locations": [{ "line": parseInt(parts[1], 10) }]
            };
        });
    });
};

module.exports = { configure, wrapper };
