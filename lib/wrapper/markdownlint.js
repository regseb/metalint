"use strict";

const markdownlint = require("markdownlint");
const SEVERITY     = require("../severity");

/**
 * Vérifier un fichier avec le linter <strong>MardownLint</strong>.
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
        const config = {
            "files":  file,
            "config": options
        };
        markdownlint(config, function (_, results) {
            if ("" === results.toString()) {
                resolve([]);
            } else {
                const notices = [];
                for (const result of results.toString().split("\n")) {
                    const parts = result.match(/[^ ]+ ([0-9]+): ([^ ]+) (.*)/);
                    notices.push({
                        "linter":    "markdownlint",
                        "rule":      parts[2],
                        "severity":  SEVERITY.ERROR,
                        "message":   parts[3],
                        "locations": [{ "line": parseInt(parts[1], 10) }]
                    });
                }
                resolve(notices);
            }
        });
    });
}; // wrapper()

module.exports = wrapper;
