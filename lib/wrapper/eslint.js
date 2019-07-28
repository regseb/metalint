/**
 * @module wrapper/eslint
 * @see {@link https://www.npmjs.com/package/eslint|ESLint}
 */

"use strict";

const fs        = require("fs");
const CLIEngine = require("eslint").CLIEngine;
const SEVERITY  = require("../severity");

/**
 * Initialise un checker pour ESLint en cherchant l'éventuelle configuration.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    let config = null;
    for (const file of fs.readdirSync(".")) {
        if ([".eslintrc.json", ".eslintrc"].includes(file)) {
            config = "../" + file;
            break;
        }
    }
    return {
        "patterns": "*.js",
        "linters":  { "eslint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>ESLint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.FATAL > level) {
        return Promise.resolve([]);
    }

    const cli = new CLIEngine({
        "baseConfig":  options,
        "ignore":      false,
        "useEslintrc": false
    });
    const report = cli.executeOnFiles([file]);
    return Promise.resolve(report.results[0].messages.map(function (result) {
        let severity;
        if (result.fatal) {
            severity = SEVERITY.FATAL;
        } else if (1 === result.severity) {
            severity = SEVERITY.WARN;
        } else {
            severity = SEVERITY.ERROR;
        }

        const locations = [];
        if (Number.isNaN(result.column)) {
            locations.push({ "line": result.line });
        } else {
            locations.push({ "line": result.line, "column": result.column });
        }

        return {
            "file":      file,
            "linter":    "eslint",
            "rule":      result.ruleId,
            "severity":  severity,
            "message":   result.message,
            "locations": locations
        };
    }).filter((n) => level >= n.severity));
};

module.exports = { configure, wrapper };
