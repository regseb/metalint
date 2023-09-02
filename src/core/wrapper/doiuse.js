/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

// Ne pas utiliser la version promise de fs car la fonction createReadStream()
// n'y est pas. https://github.com/nodejs/node/issues/38627
import { createReadStream } from "node:fs";
// Désactiver deux règles ESLint pour cet import, car elles ne supportent pas la
// propriété "exports" du package.json.
// https://github.com/import-js/eslint-plugin-import/issues/1810
// https://github.com/eslint-community/eslint-plugin-n/issues/21
// eslint-disable-next-line import/no-unresolved, n/file-extension-in-import
import doiuse from "doiuse/stream";
import Levels from "../levels.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../../type/index.d.ts").Level} Level
 * @typedef {import("../../type/index.d.ts").PartialNotice} PartialNotice
 */

/**
 * L'enrobage du linter <strong>doiuse</strong>.
 *
 * @see https://www.npmjs.com/package/doiuse
 */
export default class DoIUseWrapper extends Wrapper {
    /**
     * L'instance de DoIUse.
     *
     * @type {Object}
     */
    #doiuse;

    /**
     * Crée un enrobage pour le linter <strong>doiuse</strong>.
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
     * @param {Record<string, any>} options       Les options du linter.
     */
    constructor(context, options) {
        super(context);
        this.#doiuse = doiuse(options);
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
