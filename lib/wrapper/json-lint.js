"use strict";

const fs       = require("fs");
const jsonlint = require("json-lint");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour JSON-Lint.
 *
 * @return {Object} Les patrons et les options par défaut.
 */
const configure = function () {
    return {
        "patterns": "**/*.json",
        "linters":  { "json-lint": null }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>JSON-Lint</strong>.
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
    const notices = [];

    const source = fs.readFileSync(file, "utf-8");
    const result = jsonlint(source, options);
    if ("error" in result) {
        notices.push({
            "linter":    "json-lint",
            "rule":      null,
            "severity":  SEVERITY.ERROR,
            "message":   result.error,
            "locations": [{ "line":   result.line,
                            "column": result.character }]
        });
    }

    return Promise.resolve(notices);
};

module.exports = { configure, wrapper };
