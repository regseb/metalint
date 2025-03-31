/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
// @ts-expect-error -- JSON Lint lines-primitive ne fournit pas de types.
import { parser } from "@mapbox/jsonlint-lines-primitives";
import Levels from "../levels.js";
import Wrapper from "./wrapper.js";

/**
 * @import { Level } from "../levels.js"
 * @import { PartialNotice } from "../results.js"
 */

/**
 * L'enrobage du linter **JSON Lint `lines-primitive`** de **mapbox**.
 *
 * @see https://www.npmjs.com/package/@mapbox/jsonlint-lines-primitives
 */
export default class MapboxJSONLintLinesPrimitivesWrapper extends Wrapper {
    /**
     * La marque indiquant que le linter n'est pas configurable.
     *
     * @type {boolean}
     */
    static configurable = false;

    /**
     * Crée un enrobage pour le linter **JSON Lint `lines-primitive`** de
     * **mapbox**.
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
        if (Levels.ERROR > this.level) {
            return [];
        }

        const source = await fs.readFile(file, "utf8");
        try {
            parser.parse(source);
            return [];
        } catch (err) {
            const result = err.message.split("\n");
            return [
                {
                    file,
                    linter: "mapbox__jsonlint-lines-primitives",
                    message: result[3],
                    locations: [{ line: Number(result[0].slice(20, -1)) }],
                },
            ];
        }
    }
}
