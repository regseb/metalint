/**
 * @module
 * @license MIT
 * @see {@link https://www.npmjs.com/package/jshint|JSHint}
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import { JSHINT } from "jshint";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>JSHint</strong>.
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
    // eslint-disable-next-line new-cap
    JSHINT(source, options);
    return JSHINT.errors
        .map((result) => ({
            file,
            linter: "jshint",
            rule: result.code,
            severity: result.code.startsWith("W")
                ? SEVERITY.WARN
                : SEVERITY.ERROR,
            message: result.reason,
            locations: [
                {
                    line: result.line,
                    column: result.character,
                },
            ],
        }))
        .filter((n) => level >= n.severity);
};
