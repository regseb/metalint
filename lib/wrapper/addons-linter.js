"use strict";

const SEVERITY = require("../severity");
const linter   = require("addons-linter");

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
 * @param {string} file  Le fichier qui sera vérifié.
 * @param {number} level Le niveau de sévérité minimum des notifications
 *                       retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (file, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    const config = {
        "_":                [file],
        "logLevel":         "warn",
        "pretty":           false,
        "warningsAsErrors": false,
        "metadata":         false,
        "output":           "none",
        "boring":           false,
        "selfHosted":       false
    };
    return linter.createInstance({ config }).run().then(function (results) {
        const notices = [];
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
        return notices;
    });
};

module.exports = { configure, wrapper };
