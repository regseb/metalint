/**
 * @module wrapper/htmllint
 * @see {@link https://www.npmjs.com/package/htmllint|htmllint}
 */

"use strict";

const fs       = require("fs");
const htmllint = require("htmllint");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour htmllint en cherchant l'éventuelle configuration.
 *
 * @returns {Object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of fs.readdirSync(".")) {
        if (".htmllintrc" === file) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": "*.html",
        "linters":  { "htmllint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>htmllint</strong>.
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

    return new Promise(function (resolve) {
        fs.readFile(file, "utf-8", (_, source) => resolve(source));
    }).then(function (source) {
        return htmllint(source, options);
    }).then(function (results) {
        return results.map(function (result) {
            return {
                "file":      file,
                "linter":    "htmllint",
                "rule":      result.rule,
                "message":   result.code,
                "locations": [{ "line":   result.line,
                                "column": result.column }]
            };
        });
    });
};

module.exports = { configure, wrapper };
