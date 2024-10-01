/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import { PurgeCSS } from "purgecss";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Glob from "../utils/glob.js";
import Wrapper from "./wrapper.js";

/**
 * @import { PartialNotice } from "../results.js"
 * @import { Level } from "../levels.js"
 */

/**
 * L'enrobage du linter **PurgeCSS**.
 *
 * @see https://www.npmjs.com/package/purgecss
 */
export default class PurgeCSSWrapper extends Wrapper {
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
     * @see https://purgecss.com/configuration.html
     */
    #options;

    /**
     * Crée un enrobage pour le linter **PurgeCSS**.
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
        // Utiliser le format des patrons de Metalint.
        const glob = new Glob(options.content, { root: this.root });
        this.#options = {
            ...options,
            content: context.files.filter((f) => glob.test(f)),
            rejected: true,
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
        if (Levels.FATAL > this.level) {
            return [];
        }

        const results = await new PurgeCSS().purge({
            ...this.#options,
            css: [file],
        });
        if (0 === results.length) {
            return [
                {
                    file,
                    linter: "purgecss",
                    severity: Severities.FATAL,
                    message: "No content provided.",
                },
            ];
        }

        if (Levels.ERROR > this.level) {
            return [];
        }

        return results[0].rejected.map((rejected) => ({
            file,
            linter: "purgecss",
            message: `'${rejected}' is never used.`,
        }));
    }
}
