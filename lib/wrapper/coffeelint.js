/**
 * @module wrapper/coffeelint
 * @see {@link https://www.npmjs.com/package/coffeelint|CoffeeLint}
 */

"use strict";

const fs         = require("fs");
const coffeelint = require("coffeelint");
const SEVERITY   = require("../severity");

/**
 * Initialise un checker pour CoffeeLint en cherchant l'éventuelle
 * configuration.
 *
 * @returns {Object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of fs.readdirSync(".")) {
        if ("coffeelint.json" === file) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": "*.coffee",
        "linters":  { "coffeelint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>CoffeeLint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {Object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        fs.readFile(file, "utf-8", (_, source) => resolve(source));
    }).then(function (source) {
        return coffeelint.lint(source, options).map(function (result) {
            const severity = "warn" === result.level ? SEVERITY.WARN
                                                     : SEVERITY.ERROR;

            return {
                "file":      file,
                "linter":    "coffeelint",
                "rule":      result.rule,
                "severity":  severity,
                "message":   result.message,
                "locations": [{ "line": result.lineNumber }]
            };
        }).filter((n) => level >= n.severity);
    });
};

module.exports = { configure, wrapper };
