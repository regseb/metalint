/**
 * @module wrapper/jscs
 */

"use strict";

const fs       = require("fs");
const Checker  = require("jscs");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour JSCS en cherchant l'éventuelle configuration.
 *
 * @returns {Object} Les patrons et les options par défaut.
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
 * @param {Object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }
    const notices = [];

    const checker = new Checker();
    checker.registerDefaultRules();
    checker.configure(options);

    const source = fs.readFileSync(file, "utf-8");
    const results = checker.checkString(source);
    for (const result of results.getErrorList()) {
        notices.push({
            "linter":    "jscs",
            "rule":      result.rule,
            "severity":  SEVERITY.ERROR,
            "message":   result.message.replace(result.rule + ": ", ""),
            "locations": [{ "line":   result.line,
                            "column": result.column }]
        });
    }

    return Promise.resolve(notices);
};

module.exports = { configure, wrapper };
