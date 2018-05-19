"use strict";

const fs       = require("fs");
const jshint   = require("jshint").JSHINT;
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour JSHint en cherchant l'éventuelle configuration.
 *
 * @return {Object} Les patrons et les options par défaut.
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
        "patterns": "**/*.js",
        "linters":  { "jshint": config }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>JSHint</strong>.
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
    jshint(source, options);
    for (const result of jshint.errors) {
        let severity;
        switch (result.code[0]) {
            case "E": severity = SEVERITY.ERROR; break;
            case "W": severity = SEVERITY.WARN;
        }

        notices.push({
            "linter":    "jshint",
            "rule":      result.code,
            "severity":  severity,
            "message":   result.reason,
            "locations": [{ "line":   result.line,
                            "column": result.character }]
        });
    }

    return Promise.resolve(notices);
};

module.exports = { configure, wrapper };
