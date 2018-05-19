"use strict";

const fs       = require("fs");
const jsonlint = require("jsonlint");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour JSONLint.
 *
 * @return {Object} Les patrons et les options par défaut.
 */
const configure = function () {
    return {
        "patterns": "*.json",
        "linters":  { "jsonlint": null }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>JSONLint</strong>.
 *
 * @param {string} file  Le fichier qui sera vérifié.
 * @param {number} level Le niveau de sévérité minimum des notifications
 *                       retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (file, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }
    const notices = [];

    const source = fs.readFileSync(file, "utf-8");
    try {
        jsonlint.parse(source);
    } catch (exc) {
        const result = exc.message.split("\n");
        notices.push({
            "linter":    "jsonlint",
            "rule":      null,
            "severity":  SEVERITY.ERROR,
            "message":   result[3],
            "locations": [{ "line": parseInt(result[0].slice(20, -1), 10) + 1 }]
        });
    }

    return Promise.resolve(notices);
};

module.exports = { configure, wrapper };
