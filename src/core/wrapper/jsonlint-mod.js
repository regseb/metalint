/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
// @ts-expect-error -- JSON Lint (mod) ne fournit pas de types.
import jsonlint from "jsonlint-mod";
import Levels from "../levels.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../results.js").PartialNotice} PartialNotice
 * @typedef {import("../levels.js").Level} Level
 */

/**
 * L'enrobage du linter <strong>JSON Lint (mod)</strong>.
 *
 * @see https://www.npmjs.com/package/jsonlint-mod
 */
export default class JSONLintModWrapper extends Wrapper {
    /**
     * Crée un enrobage pour le linter <strong>JSON Lint (mod)</strong>.
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
     * @param {Record<string, unknown>} _options      Les non-options du linter.
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
        if (Levels.ERROR > this.level) {
            return [];
        }

        const source = await fs.readFile(file, "utf8");
        try {
            jsonlint.parse(source);
            return [];
        } catch (err) {
            const result = err.message.split("\n");
            return [
                {
                    file,
                    linter: "jsonlint-mod",
                    message: result[3],
                    locations: [{ line: Number(result[0].slice(20, -1)) }],
                },
            ];
        }
    }
}
