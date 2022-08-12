/**
 * @module
 * @see {@link https://www.npmjs.com/package/csslint|CSSLint}
 */

import fs from "node:fs/promises";
import { CSSLint } from "csslint";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec le linter <strong>CSSLint</strong>.
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

    const source = await fs.readFile(file, "utf8");
    return CSSLint.verify(source, options).messages
                  .map((result) => ({
        file,
        linter:    "csslint",
        rule:      result.rule.id,
        severity:  "warning" === result.type ? SEVERITY.WARN
                                             : SEVERITY.ERROR,
        message:   result.message,
        locations: [{
            line:   result.line,
            column: result.col,
        }],
    })).filter((n) => level >= n.severity);
};
