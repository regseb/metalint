/**
 * @module
 * @license MIT
 * @see {@link https://www.npmjs.com/package/markdownlint|Markdownlint}
 * @author Sébastien Règne
 */

import markdownlint from "markdownlint";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>MarkdownLint</strong>.
 *
 * @param {string}           file          Le fichier qui sera vérifié.
 * @param {Object|undefined} options       Les options qui seront passées au
 *                                         linter ou <code>undefined</code> pour
 *                                         les options par défaut.
 * @param {Object}           context       Le contexte avec d'autres
 *                                         informations.
 * @param {number}           context.level Le niveau de sévérité minimum des
 *                                         notifications retournées.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, options, { level }) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const config = {
        files: file,
        config: options,
    };
    const results = await markdownlint.promises.markdownlint(config);
    return Object.values(results)
        .shift()
        .map((result) => ({
            file,
            linter: "markdownlint",
            rule: result.ruleNames.join("/"),
            severity: SEVERITY.ERROR,
            message:
                result.ruleDescription +
                " [" +
                (result.errorDetail ?? "") +
                (null === result.errorContext
                    ? ""
                    : `Context: "${result.errorContext}"`) +
                "]",
            locations: [{ line: result.lineNumber }],
        }));
};
