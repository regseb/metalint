/**
 * @module wrapper/addons-linter
 * @see {@link https://www.npmjs.com/package/addons-linter|Add-ons Linter}
 */

"use strict";

const path     = require("path");
const linter   = require("addons-linter");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour Add-ons Linter.
 *
 * @returns {Object} Les patrons et les options par défaut.
 */
const configure = function () {
    return {
        "patterns": "*.xpi",
        "linters":  { "addons-linter": null }
    };
};

/**
 * Vérifie un fichier avec <strong>Add-ons Linter</strong>.
 *
 * @param {string} file  Le fichier qui sera vérifié.
 * @param {number} level Le niveau de sévérité minimum des notifications
 *                       retournées.
 * @returns {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    const config = {
        "_":                [file],
        "logLevel":         "error",
        "stack":            false,
        "pretty":           false,
        "warningsAsErrors": false,
        "metadata":         false,
        "output":           "none",
        "boring":           false,
        "selfHosted":       false
    };
    return linter.createInstance({ config }).run().then(function (results) {
        return [].concat(results.errors, results.warnings, results.notices).map(
                                                             function (result) {
            let severity;
            switch (result["_type"]) {
                case "error":   severity = SEVERITY.ERROR; break;
                case "warning": severity = SEVERITY.WARN;  break;
                case "notice":  severity = SEVERITY.INFO;
            }

            return {
                "file":      undefined === result.file
                                                 ? file
                                                 : path.join(file, result.file),
                "linter":   "addons-linter",
                "rule":     result.code,
                "severity": severity,
                "message":  result.message
            };
        }).filter((n) => level >= n.severity);
    });
};

module.exports = { configure, wrapper };
