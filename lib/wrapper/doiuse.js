/**
 * @module wrapper/doiuse
 * @see {@link https://www.npmjs.com/package/doiuse|doiuse}
 */

"use strict";

const fs       = require("fs");
const doiuse   = require("doiuse/stream");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour doiuse.
 *
 * @returns {Object} Les patrons et les options par défaut.
 */
const configure = function () {
    return {
        "patterns": "*.css",
        "linters":  { "doiuse": {} }
    };
};

/**
 * Vérifie un fichier avec le linter <strong>doiuse</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {Object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        const notices = [];
        fs.createReadStream(file).pipe(doiuse(options))
                                 .on("data", function (result) {
            notices.push({
                "file":      file,
                "linter":    "doiuse",
                "rule":      result.feature,
                "message":   result.message.substring(
                                              result.message.indexOf(": ") + 2,
                                              result.message.lastIndexOf(" (")),
                "locations": [{
                    "line":   result.usage.source.original.start.line,
                    "column": result.usage.source.original.start.column
                }]
            });
        }).on("end", function () {
            resolve(notices);
        });
    });
};

module.exports = { configure, wrapper };
