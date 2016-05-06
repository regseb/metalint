"use strict";

const markdownlint = require("markdownlint");
const SEVERITY     = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>MardownLint</strong>.
 *
 * @param {string} source  Le code source qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        const config = {
            "strings": { source },
            "config":  options
        };
        markdownlint(config, function (_, results) {
            // Ignorer les erreurs car la validation d'une chaine de caractères
            // ne remonte pas d'erreur.
            if (0 === Object.keys(results.source).length) {
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
