"use strict";

const fs        = require("fs");
const html5Lint = require("html5-lint");
const SEVERITY  = require("../severity");

/**
 * Vérifier un fichier avec le linter <strong>html5-lint</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 * @see https://html5.validator.nu/
 */
const wrapper = function (file, options, level) {
    if (SEVERITY.FATAL > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        const source = fs.readFileSync(file, "utf-8");
        const config = {
            "errorsOnly": SEVERITY.ERROR >= level,
            "service":    options.service
        };
        html5Lint(source, config, function (err, results) {
            if (null === err) {
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
            } else {
                resolve([
                    {
                        "linter":    "html5-lint",
                        "rule":      null,
                        "severity":  SEVERITY.FATAL,
                        "message":   err.message,
                        "locations": []
                    }
                ]);
            }
        });
    });
}; // wrapper()

module.exports = wrapper;
