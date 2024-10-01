/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import process from "node:process";
// @ts-expect-error -- JavaScript Standard Style ne fournit pas de types.
import standard from "standard";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { PartialNotice } from "../results.js"
 * @import { Level } from "../levels.js"
 */

/**
 * L'enrobage du linter **JavaScript Standard Style**.
 *
 * @see https://www.npmjs.com/package/standard
 */
export default class StandardWrapper extends Wrapper {
    /**
     * La marque indiquant que le linter n'est pas configurable.
     *
     * @type {boolean}
     */
    static configurable = false;

    /**
     * Crée un enrobage pour le linter **JavaScript Standard Style**.
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
     * @param {Record<string, unknown>} _options      Les non-options du linter.
     */
    constructor(context, _options) {
        super(context);
    }

    /**
     * Analyse un fichier.
     *
     * @param {string} file Le fichier qui sera analysé.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    async lint(file) {
        if (Levels.FATAL > this.level) {
            return [];
        }

        const results = await standard.lintFiles([file], {
            // Forcer le répertoire courant, car Standard utilise le répertoire
            // courant au moment de l'import de "standard".
            // https://github.com/standard/standard/issues/1956
            cwd: process.cwd(),
        });
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
                    linter: "standard",
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
