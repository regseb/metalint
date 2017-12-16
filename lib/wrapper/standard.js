"use strict";

const standard = require("standard");
const SEVERITY = require("../severity");

/**
 * Vérifier un fichier avec le linter <strong>JavaScript Standard
 * Style</strong>.
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
        standard.lintFiles([file], function (_, results) {
            const notices = [];
            for (const result of results.results[0].messages) {
                notices.push({
                    "linter":    "standard",
                    "rule":      result.ruleId,
                    "severity":  SEVERITY.ERROR,
                    "message":   result.message,
                    "locations": [{ "line":   result.line,
                                    "column": result.column }]
                });
            }
            resolve(notices);
        });
    });
};

module.exports = wrapper;
