/**
 * @module wrapper/htmlhint
 * @see {@link https://www.npmjs.com/package/htmlhint|HTMLHint}
 */

"use strict";

const fs       = require("fs");
const HTMLHint = require("htmlhint").HTMLHint;
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour HTMLHint en cherchant l'éventuelle configuration.
 *
 * @returns {Object} Le patron et les options par défaut.
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
 * @param {Object} options Les options qui seront passées au linter.
 * @returns {Promise.Array.<Object>} Une promesse retournant la liste des
 *                                   notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    const source = fs.readFileSync(file, "utf-8");
    const results = HTMLHint.verify(source, null === options ? undefined
                                                             : options);
    return Promise.resolve(results.map(function (result) {
        const severity = "warning" === result.type ? SEVERITY.WARN
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
    }).filter((n) => level >= n.severity));
};

module.exports = { configure, wrapper };
