/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

// @ts-expect-error -- SVGLint ne fournit pas de types.
// eslint-disable-next-line import/no-unresolved
import SVGLint from "svglint";
import Levels from "../levels.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../results.js").PartialNotice} PartialNotice
 * @typedef {import("../levels.js").Level} Level
 */

/**
 * L'enrobage du linter <strong>SVGLint</strong>.
 *
 * @see https://www.npmjs.com/package/svglint
 */
export default class SVGLintWrapper extends Wrapper {
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
     * @see https://github.com/birjj/svglint#config
     */
    #options;

    /**
     * Crée un enrobage pour le linter <strong>SVGLint</strong>.
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
        const linting = await SVGLint.lintFile(file, this.#options);
        await new Promise((resolve) => {
            linting.on("done", resolve);
        });

        const notices = [];
        for (const reporter of Object.values(linting.results)) {
            for (const message of reporter.messages) {
                notices.push({
                    file,
                    linter: "svglint",
                    rule: reporter.name,
                    message: message.reason,
                    locations:
                        undefined === message.line
                            ? []
                            : [
                                  {
                                      // Augmenter de un le numéro de la ligne
                                      // et de la colonne, car SVGLint commence
                                      // les numérotations à zéro.
                                      line: message.line + 1,
                                      column: message.column + 1,
                                  },
                              ],
                });
            }
        }
        return notices;
    }
}
