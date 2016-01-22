/* global require, module */

"use strict";

const html5Lint = require("html5-lint");
const SEVERITY = require("../severity");

/**
 * Vérifier du code source avec le linter <strong>html5-lint</strong>.
 *
 * @param {string} source  Le code source qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 * @see https://html5.validator.nu/
 */
const wrapper = function (source, options, level) {
    if (SEVERITY.WARN > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve, reject) {
        html5Lint(source, options, function (err, results) {
            if (null !== err) {
                reject(err);
            } else {
                const notices = [];
                for (const result of results.messages) {
                    let severity;
                    switch (result.type) {
                        case "info":    severity = SEVERITY.INFO;  break;
                        case "warning": severity = SEVERITY.WARN;  break;
                        case "error":   severity = SEVERITY.ERROR; break;
                        default:        severity = SEVERITY.FATAL;
                    }

                    let locations;
                    if ("lastLine" in result) {
                        locations = [{ "line": result.lastLine,
                                       "column": result.lastColumn }];
                    } else {
                        locations = null;
                    }

                    if (level >= severity) {
                        notices.push({
                            "linter":    "html5-lint",
                            "rule":      null,
                            "severity":  severity,
                            "message":   result.message,
                            "locations": locations
                        });
                    }
                }
                resolve(notices);
            }
        });
    });
}; // wrapper()

module.exports = wrapper;
