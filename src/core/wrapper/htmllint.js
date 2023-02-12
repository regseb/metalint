/**
 * @module
 * @license MIT
 * @see {@link https://www.npmjs.com/package/htmllint|htmllint}
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import htmllint from "htmllint";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>htmllint</strong>.
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

    const source = await fs.readFile(file, "utf8");
    const results = await htmllint(source, options);
    return results.map((result) => ({
        file,
        linter: "htmllint",
        rule: result.rule,
        message: result.code,
        locations: [
            {
                line: result.line,
                column: result.column,
            },
        ],
    }));
};
