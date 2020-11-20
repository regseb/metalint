/**
 * @module
 * @see {@link https://www.npmjs.com/package/doiuse|doiuse}
 */

import fs from "fs";
import doiuse from "doiuse/stream.js";
import { SEVERITY } from "../severity.js";

/**
 * @typedef {import("../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>doiuse</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {Object} options Les options qui seront passées au linter.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    /** @type {string[]} */
    const results = await new Promise((resolve) => {
        /** @type {Object[]} */
        const data = [];
        fs.createReadStream(file).pipe(doiuse(options))
                                 .on("data", (d) => data.push(d))
                                 .on("end", () => resolve(data));
    });
    return results.map((result) => ({
        file,
        linter:    "doiuse",
        rule:      result.feature,
        severity:  SEVERITY.ERROR,
        message:   result.message.slice(result.message.indexOf(": ") + 2,
                                        result.message.lastIndexOf(" (")),
        locations: [{
            line:   result.usage.source.original.start.line,
            column: result.usage.source.original.start.column,
        }],
    }));
};
