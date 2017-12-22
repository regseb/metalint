"use strict";

const fs       = require("fs");
const htmllint = require("htmllint");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour htmllint en cherchant l'éventuelle configuration.
 *
 * @return {Object} Les patrons et les options par défaut.
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
        "patterns": "**/*.html",
        "linters":  { "htmllint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>htmllint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.Array.<Object>} Une promesse retournant la liste des
 *                                  notifications.
 */
const wrapper = function (file, options, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    const source = fs.readFileSync(file, "utf-8");
    return htmllint(source, options).then(function (results) {
        const notices = [];
        for (const result of results) {
            notices.push({
                "linter":    "htmllint",
                "rule":      result.rule,
                "severity":  SEVERITY.ERROR,
                "message":   result.code,
                "locations": [{ "line":   result.line,
                                "column": result.column }]
            });
        }
        return notices;
    });
};

module.exports = { configure, wrapper };
