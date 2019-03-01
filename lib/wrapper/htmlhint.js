/**
 * @module wrapper/htmlhint
 * @see {@link https://www.npmjs.com/package/htmlhint|HTMLHint}
 */

"use strict";

const fs       = require("fs");
const HTMLHint = require("htmlhint").default;
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour HTMLHint en cherchant l'éventuelle configuration.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of fs.readdirSync(".")) {
        if (".htmlhintrc" === file) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": "*.html",
        "linters":  { "htmlhint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>HTMLHint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {object} options Les options qui seront passées au linter.
 * @returns {Promise.Array.<object>} Une promesse retournant la liste des
 *                                   notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        fs.readFile(file, "utf-8", (_, source) => resolve(source));
    }).then(function (source) {
        const results = HTMLHint.verify(source, null === options ? undefined
                                                                 : options);
        return results.map(function (result) {
            const severity = "warn" === result.type ? SEVERITY.WARN
                                                    : SEVERITY.ERROR;
            return {
                "file":      file,
                "linter":    "htmlhint",
                "rule":      result.rule.id,
                "severity":  severity,
                "message":   result.message,
                "locations": [{ "line":   result.line,
                                "column": result.col }]
            };
        }).filter((n) => level >= n.severity);
    });
};

module.exports = { configure, wrapper };
