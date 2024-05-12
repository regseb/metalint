/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

// Désactiver la règle suivante pour cet import, car elle ne supporte pas la
// propriété "exports" du package.json.
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { MLEngine } from "markuplint";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../results.js").PartialNotice} PartialNotice
 * @typedef {import("../levels.js").Level} Level
 */

/**
 * L'enrobage du linter <strong>markuplint</strong>.
 *
 * @see https://www.npmjs.com/package/markuplint
 */
export default class MarkuplintWrapper extends Wrapper {
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
     * @see https://markuplint.dev/docs/configuration/properties
     */
    #options;

    /**
     * Crée un enrobage pour le linter <strong>markuplint</strong>.
     *
     * @param {Object}                  context       Le contexte de l'enrobage.
     * @param {Level}                   context.level Le niveau de sévérité
     *                                                minimum des notifications
     *                                                retournées.
     * @param {boolean}                 context.fix   La marque indiquant s'il
     *                                                faut corriger le fichier.
     * @param {string}                  context.root  L'adresse du répertoire où
     *                                                se trouve le répertoire
     *                                                <code>.metalint/</code>.
     * @param {string[]}                context.files La liste de tous les
     *                                                fichiers analysés.
     * @param {Record<string, unknown>} options       Les options du linter.
     */
    constructor(context, options) {
        super(context);
        this.#options = options;
    }

    /**
     * Vérifie un fichier.
     *
     * @param {string} file Le fichier qui sera vérifié.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    async lint(file) {
        if (Levels.ERROR > this.level) {
            return [];
        }

        const engine = new MLEngine(await MLEngine.toMLFile(file), {
            config: this.#options,
        });
        const results = await engine.exec();

        return results.violations
            .map((result) => {
                let severity;
                if ("info" === result.severity) {
                    severity = Severities.INFO;
                } else if ("warning" === result.severity) {
                    severity = Severities.WARN;
                } else {
                    severity = Severities.ERROR;
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
            .filter((n) => this.level >= n.severity);
    }
}
