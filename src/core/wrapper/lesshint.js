/**
 * @module
 * @see {@link https://www.npmjs.com/package/lesshint|lesshint}
 */

import { Lesshint } from "lesshint";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>lesshint</strong>.
 *
 * @param {string}  file    Le fichier qui sera vérifié.
 * @param {number}  level   Le niveau de sévérité minimum des notifications
 *                          retournées.
 * @param {?Object} options Les options qui seront passées au linter ou
 *                          <code>null</code> pour les options par défaut.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level, options) {
    if (SEVERITY.FATAL > level) {
        return [];
    }

    const lesshint = new Lesshint();
    lesshint.configure(options);
    const results = await lesshint.checkFiles(file);
    return results.map((result) => {
        let rule;
        let severity;
        if ("parse error" === result.linter) {
            rule = "parseError";
            severity = SEVERITY.FATAL;
        } else {
            rule = result.linter;
            severity = "warning" === result.severity ? SEVERITY.WARN
                                                     : SEVERITY.ERROR;
        }

        return {
            file,
            linter:    "lesshint",
            rule,
            severity,
            message:   result.message,
            locations: [{
                line:   result.line,
                column: result.column,
            }],
        };
    }).filter((n) => level >= n.severity);
};
