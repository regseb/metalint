/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
// @ts-expect-error -- CSSLint ne fournit pas de types.
import { CSSLint } from "csslint";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { PartialNotice } from "../results.js"
 * @import { Level } from "../levels.js"
 */

/**
 * L'enrobage du linter **CSSLint**.
 *
 * @see https://www.npmjs.com/package/csslint
 */
export default class CSSLintWrapper extends Wrapper {
    /**
     * La marque indiquant que le linter est configurable.
     *
     * @type {boolean}
     */
    static configurable = true;

    /**
     * Les options du linter.
     *
     * @type {Record<string, unknown>}
     * @see https://github.com/CSSLint/csslint/wiki/Rules
     */
    #options;

    /**
     * Crée un enrobage pour le linter **CSSLint**.
     *
     * @param {Object}                  context       Le contexte de l'enrobage.
     * @param {Level}                   context.level Le niveau de sévérit
     *                                                minimum des notifications
     *                                                retournées.
     * @param {boolean}                 context.fix   La marque indiquant s'il
     *                                                faut corriger le fichier.
     * @param {string}                  context.root  L'adresse du répertoire où
     *                                                se trouve le répertoire
     *                                                `.metalint/`.
     * @param {string[]}                context.files La liste de tous les
     *                                                fichiers analysés.
     * @param {Record<string, unknown>} options       Les options du linter.
     */
    constructor(context, options) {
        super(context);
        this.#options = options;
    }

    /**
     * Analyse un fichier.
     *
     * @param {string} file Le fichier qui sera analysé.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    async lint(file) {
        if (Levels.ERROR > this.level) {
            return [];
        }

        const source = await fs.readFile(file, "utf8");
        return CSSLint.verify(source, this.#options)
            .messages.map((result) => ({
                file,
                linter: "csslint",
                rule: result.rule.id,
                severity:
                    "warning" === result.type
                        ? Severities.WARN
                        : Severities.ERROR,
                message: result.message,
                locations: [{ line: result.line, column: result.col }],
            }))
            .filter((n) => this.level >= n.severity);
    }
}
