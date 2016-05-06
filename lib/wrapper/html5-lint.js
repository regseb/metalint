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
    if (SEVERITY.FATAL > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        const config = {
            "errorsOnly": SEVERITY.ERROR >= level,
            "service":    options.service
        };
        html5Lint(source, config, function (err, results) {
            if (null !== err) {
                resolve([
                    {
                        "linter":    "html5-lint",
                        "rule":      null,
                        "severity":  SEVERITY.FATAL,
                        "message":   err.message,
                        "locations": []
                    }
                ]);
            } else {
                const notices = [];
                for (const result of results.messages) {
                    let severity;
                    if ("error" === result.type) {
                        severity = SEVERITY.ERROR;
                    } else {
                        severity = SEVERITY.WARN;
                    }

                    if (level >= severity) {
                        notices.push({
                            "linter":    "html5-lint",
                            "rule":      null,
                            "severity":  severity,
                            "message":   result.message,
                            "locations": [{ "line":   result.lastLine,
                                            "column": result.lastColumn }]
                        });
                    }
                }
                resolve(notices);
            }
        });
    });
}; // wrapper()

module.exports = wrapper;
