/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

// Ne pas utiliser la version promise de fs car la fonction createReadStream()
// n'y est pas. https://github.com/nodejs/node/issues/38627
import { createReadStream } from "node:fs";
// @ts-expect-error -- doiuse ne fournit pas de types.
// Désactiver la règle suivante pour cet import, car elle ne supporte pas la
// propriété "exports" du package.json.
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import doiuse from "doiuse/stream";
import Levels from "../levels.js";
import Wrapper from "./wrapper.js";

/**
 * @import { Writable } from "node:stream"
 * @import { PartialNotice } from "../results.js"
 * @import { Level } from "../levels.js"
 */

/**
 * L'enrobage du linter **doiuse**.
 *
 * @see https://www.npmjs.com/package/doiuse
 */
export default class DoIUseWrapper extends Wrapper {
    /**
     * La marque indiquant que le linter est configurable.
     *
     * @type {boolean}
     */
    static configurable = true;

    /**
     * L'instance de DoIUse.
     *
     * @type {Writable}
     */
    #doiuse;

    /**
     * Crée un enrobage pour le linter **doiuse**.
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
        this.#doiuse = doiuse(options);
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

        const results = await new Promise((resolve) => {
            const data = [];
            createReadStream(file)
                .pipe(this.#doiuse)
                .on("data", (d) => data.push(d))
                .on("end", () => resolve(data));
        });
        return results.map((result) => ({
            file,
            linter: "doiuse",
            rule: result.feature,
            message: result.message.slice(
                result.message.indexOf(": ") + 2,
                result.message.lastIndexOf(" ("),
            ),
            locations: [
                {
                    line: result.usage.source.start.line,
                    column: result.usage.source.start.column,
                },
            ],
        }));
    }
}
