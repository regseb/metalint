"use strict";

const execFile = require("child_process").execFile;
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour Add-ons Linter.
 *
 * @return {Object} Les patrons et les options par défaut.
 */
const configure = function () {
    return {
        "patterns": "**/*.xpi",
        "linters":  { "addons-linter": null }
    };
};

/**
 * Vérifie un fichier avec <strong>Add-ons Linter</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (file, options, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        const args = ["--output", "json", file];
        execFile("addons-linter", args, function (_, stdout) {
            const notices = [];
            const results = JSON.parse(stdout);
            for (const result of [].concat(results.errors, results.warnings,
                                           results.notices)) {
                let severity;
                switch (result["_type"]) {
                    case "error":   severity = SEVERITY.ERROR; break;
                    case "warning": severity = SEVERITY.WARN;  break;
                    case "notice":  severity = SEVERITY.INFO;
                }

                notices.push({
                    "linter":    "addons-linter",
                    "rule":      result.code,
                    "severity":  severity,
                    "message":   result.message,
                    "locations": []
                });
            }
            resolve(notices);
        });
    });
};

module.exports = { configure, wrapper };
