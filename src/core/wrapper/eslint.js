/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import { ESLint } from "eslint";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { PartialNotice } from "../results.js"
 * @import { Level } from "../levels.js"
 */

/**
 * L'enrobage du linter **ESLint**.
 *
 * @see https://www.npmjs.com/package/eslint
 */
export default class ESLintWrapper extends Wrapper {
    /**
     * La marque indiquant que le linter est configurable.
     *
     * @type {boolean}
     */
    static configurable = true;

    /**
     * L'instance de ESLint.
     *
     * @type {ESLint}
     * @see https://eslint.org/docs/latest/integrate/nodejs-api
     */
    #eslint;

    /**
     * Crée un enrobage pour le linter **ESLint**.
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
        this.#eslint = new ESLint({
            globInputPaths: false,
            ignore: false,
            overrideConfigFile: true,
            overrideConfig: options,
            fix: this.fix,
        });
    }

    /**
     * Analyse un fichier.
     *
     * @param {string} file Le fichier qui sera analysé.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    async lint(file) {
        if (Levels.FATAL > this.level && !this.fix) {
            return [];
        }

        const results = await this.#eslint.lintFiles(file);
        ESLint.outputFixes(results);

        // Récupérer seulement le premier résultat (et l'unique), car un seul
        // fichier a été analysé.
        return results[0].messages
            .map((result) => {
                let severity;
                if (result.fatal) {
                    severity = Severities.FATAL;
                } else if (1 === result.severity) {
                    severity = Severities.WARN;
                } else {
                    severity = Severities.ERROR;
                }

                return {
                    file,
                    linter: "eslint",
                    // Convertir les éventuelles valeurs `null` en `undefined`.
                    rule: result.ruleId ?? undefined,
                    severity,
                    message: result.message,
                    locations: [
                        {
                            line: result.line,
                            column: result.column,
                            endLine: result.endLine,
                            endColumn: result.endColumn,
                        },
                    ],
                };
            })
            .filter((n) => this.level >= n.severity);
    }
}
