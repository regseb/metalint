"use strict";

const fs           = require("fs");
const markdownlint = require("markdownlint");
const SEVERITY     = require("../severity");

/**
 * Initialise un checker pour Markdownlint en cherchant l'éventuelle
 * configuration.
 *
 * @return {Object} Les patrons et les options par défaut.
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
 * @param {Object} options Les options qui seront passées au linter.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
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
        markdownlint(config, function (_, results) {
            if ("" === results.toString()) {
                resolve([]);
            } else {
                const notices = [];
                for (const result of results.toString().split("\n")) {
                    const parts = result.match(/[^ ]+ ([0-9]+): ([^ ]+) (.*)/);
                    notices.push({
                        "linter":    "markdownlint",
                        "rule":      parts[2],
                        "severity":  SEVERITY.ERROR,
                        "message":   parts[3],
                        "locations": [{ "line": parseInt(parts[1], 10) }]
                    });
                }
                resolve(notices);
            }
        });
    });
};

module.exports = { configure, wrapper };
