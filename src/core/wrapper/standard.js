/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import standard from "standard";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../../type/index.d.ts").Level} Level
 * @typedef {import("../../type/index.d.ts").PartialNotice} PartialNotice
 */

/**
 * L'enrobage du linter <strong>JavaScript Standard Style</strong>.
 *
 * @see https://www.npmjs.com/package/standard
 */
export default class StandardWrapper extends Wrapper {
    /**
     * Crée un enrobage pour le linter <strong>JavaScript Standard
     * Style</strong>.
     *
     * @param {Object}              context       Le contexte de l'enrobage.
     * @param {Level}               context.level Le niveau de sévérité minimum
     *                                            des notifications retournées.
     * @param {boolean}             context.fix   La marque indiquant s'il faut
     *                                            corriger le fichier.
     * @param {string}              context.root  L'adresse du répertoire où se
     *                                            trouve le répertoire
     *                                            <code>.metalint/</code>.
     * @param {string[]}            context.files La liste de tous les fichiers
     *                                            analysés.
     * @param {Record<string, any>} _options      Les non-options du linter.
     */
    constructor(context, _options) {
        super(context);
    }

    /**
     * Vérifie un fichier.
     *
     * @param {string} file Le fichier qui sera vérifié.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    async lint(file) {
        if (Levels.FATAL > this.level) {
            return [];
        }

        const results = await standard.lintFiles([file]);
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
                            ...(undefined === result.endLine
                                ? {}
                                : { endLine: result.endLine }),
                            ...(undefined === result.endColumn
                                ? {}
                                : { endColumn: result.endColumn }),
                        },
                    ],
                };
            })
            .filter((n) => this.level >= n.severity);
    }
}
