/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import stylelint from "stylelint";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { PartialNotice } from "../results.js"
 * @import { Level } from "../levels.js"
 */

/**
 * L'enrobage du linter **Stylelint**.
 *
 * @see https://www.npmjs.com/package/stylelint
 */
export default class StylelintWrapper extends Wrapper {
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
     * @see https://stylelint.io/user-guide/configure
     */
    #options;

    /**
     * Crée un enrobage pour le linter **Stylelint**.
     *
     * @param {Object}                  context       Le contexte de l'enrobage.
     * @param {Level}                   context.level Le niveau de sévérité
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
        this.#options = {
            config: options,
            fix: this.fix,
            // Laisser à Metalint la gestion des fichiers à ignorer.
            disableDefaultIgnores: true,
        };
    }

    /**
     * Analyse un fichier.
     *
     * @param {string} file Le fichier qui sera analysé.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    async lint(file) {
        if (Levels.ERROR > this.level && !this.fix) {
            return [];
        }

        const results = await stylelint.lint({
            ...this.#options,
            files: file,
        });

        return results.results[0].warnings
            .map((result) => ({
                file,
                linter: "stylelint",
                rule: result.rule,
                severity:
                    "warning" === result.severity
                        ? Severities.WARN
                        : Severities.ERROR,
                message: result.text.slice(0, result.text.lastIndexOf(" (")),
                locations: [{ line: result.line, column: result.column }],
            }))
            .filter((n) => this.level >= n.severity);
    }
}
