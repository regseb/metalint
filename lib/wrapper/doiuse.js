/**
 * @module
 * @see {@link https://www.npmjs.com/package/doiuse|doiuse}
 */

"use strict";

const fs       = require("fs");
const doiuse   = require("doiuse/stream");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour doiuse.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    return {
        patterns: "*.css",
        linters:  { doiuse: {} },
    };
};

/**
 * Vérifie un fichier avec le linter <strong>doiuse</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {object} options Les options qui seront passées au linter.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = async function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const results = await new Promise((resolve) => {
        const data = [];
        fs.createReadStream(file).pipe(doiuse(options))
                                 .on("data", (d) => data.push(d))
                                 .on("end", () => resolve(data));
    });
    return results.map((result) => ({
        file:      file,
        linter:    "doiuse",
        rule:      result.feature,
        message:   result.message.slice(result.message.indexOf(": ") + 2,
                                        result.message.lastIndexOf(" (")),
        locations: [{
            line:   result.usage.source.original.start.line,
            column: result.usage.source.original.start.column,
        }],
    }));
};

module.exports = { configure, wrapper };
