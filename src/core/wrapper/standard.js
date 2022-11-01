/**
 * @module
 * @see {@link https://www.npmjs.com/package/standard|JavaScript Standard Style}
 */

import standard from "standard";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>JavaScript Standard Style</strong>.
 *
 * @param {string} file  Le fichier qui sera vérifié.
 * @param {number} level Le niveau de sévérité minimum des notifications
 *                       retournées.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level) {
    if (SEVERITY.FATAL > level) {
        return [];
    }

    const results = await standard.lintFiles([file]);
    return results[0].messages.map((result) => {
        let severity;
        if (result.fatal) {
            severity = SEVERITY.FATAL;
        } else if (1 === result.severity) {
            severity = SEVERITY.WARN;
        } else {
            severity = SEVERITY.ERROR;
        }

        return {
            file,
            linter: "standard",
            ...null === result.ruleId ? {}
                                      : { rule: result.ruleId },
            severity,
            message:   result.message,
            locations: [{
                line:   result.line,
                column: result.column,
                ...undefined === result.endLine ? {}
                                                : { endLine: result.endLine },
                ...undefined === result.endColumn
                                              ? {}
                                              : { endColumn: result.endColumn },
            }],
        };
    }).filter((n) => level >= n.severity);
};
