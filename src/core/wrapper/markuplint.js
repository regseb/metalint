/**
 * @module
 * @license MIT
 * @see {@link https://www.npmjs.com/package/markuplint|markuplint}
 * @author Sébastien Règne
 */

import { MLEngine } from "markuplint";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>markuplint</strong>.
 *
 * @param {string}           file    Le fichier qui sera vérifié.
 * @param {number}           level   Le niveau de sévérité minimum des
 *                                   notifications retournées.
 * @param {Object|undefined} options Les options qui seront passées au linter ou
 *                                   <code>undefined</code> pour les options par
 *                                   défaut.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const engine = new MLEngine(await MLEngine.toMLFile(file), {
        config: options,
    });
    const results = await engine.exec();

    return results.violations
        .map((result) => {
            let severity;
            if ("info" === result.severity) {
                severity = SEVERITY.INFO;
            } else if ("warning" === result.severity) {
                severity = SEVERITY.WARN;
            } else {
                severity = SEVERITY.ERROR;
            }

            return {
                file,
                linter: "markuplint",
                rule: result.ruleId,
                severity,
                message: result.message,
                locations: [{ line: result.line, column: result.col }],
            };
        })
        .filter((n) => level >= n.severity);
};
