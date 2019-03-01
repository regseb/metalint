/**
 * @module wrapper/jscs
 * @see {@link https://www.npmjs.com/package/jscs|JSCS}
 */

"use strict";

const fs       = require("fs");
const Checker  = require("jscs");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour JSCS en cherchant l'éventuelle configuration.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = {};
    for (const file of fs.readdirSync(".")) {
        if (".jscsrc" === file) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": "*.js",
        "linters":  { "jscs": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>JSCS</strong>.
 *
 * @deprecated JSCS a été intégré dans ESLint
 *             (https://eslint.org/blog/2016/07/jscs-end-of-life).
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

    const checker = new Checker();
    checker.registerDefaultRules();
    checker.configure(options);

    return checker.checkFile(file).then(function (results) {
        return results.getErrorList().map(function (result) {
            return {
                "file":      file,
                "linter":    "jscs",
                "rule":      result.rule,
                "message":   result.message.replace(result.rule + ": ", ""),
                // Augmenter de un le numéro de la colonne car JSCS commence les
                // numérotations à zéro.
                "locations": [{ "line":   result.line,
                                "column": result.column + 1 }]
            };
        });
    });
};

module.exports = { configure, wrapper };
