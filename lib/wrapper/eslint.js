"use strict";

const fs       = require("fs");
const linter   = require("eslint").linter;
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour ESLint en cherchant l'éventuelle configuration.
 *
 * @return {Object} Les patrons et les options par défaut.
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
        "patterns": "**/*.js",
        "linters":  { "eslint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>ESLint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (file, options, level) {
    if (SEVERITY.FATAL > level) {
        return Promise.resolve([]);
    }
    const notices = [];

    const results = linter.verify(fs.readFileSync(file, "utf-8"), options);
    for (const result of results) {
        let severity;
        if (result.fatal) {
            severity = SEVERITY.FATAL;
        } else if (1 === result.severity) {
            severity = SEVERITY.WARN;
        } else {
            severity = SEVERITY.ERROR;
        }

        if (level >= severity) {
            notices.push({
                "linter":    "eslint",
                "rule":      result.ruleId,
                "severity":  severity,
                "message":   result.message,
                "locations": [{ "line":   result.line,
                                "column": result.column }]
            });
        }
    }
    return Promise.resolve(notices);
};

module.exports = { configure, wrapper };
