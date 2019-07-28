/**
 * @module wrapper/jshint
 * @see {@link https://www.npmjs.com/package/jshint|JSHint}
 */

"use strict";

const fs       = require("fs");
const jshint   = require("jshint").JSHINT;
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour JSHint en cherchant l'éventuelle configuration.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of fs.readdirSync(".")) {
        if (".jshintrc" === file) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": "*.js",
        "linters":  { "jshint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>JSHint</strong>.
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
        fs.readFile(file, "utf-8", (_, source) => resolve(source));
    }).then(function (source) {
        jshint(source, options);
        return jshint.errors.map(function (result) {
            return {
                "file":      file,
                "linter":    "jshint",
                "rule":      result.code,
                "severity":  result.code.startsWith("W") ? SEVERITY.WARN
                                                         : SEVERITY.ERROR,
                "message":   result.reason,
                "locations": [{
                    "line":   result.line,
                    "column": result.character
                }]
            };
        }).filter((n) => level >= n.severity);
    });
};

module.exports = { configure, wrapper };
