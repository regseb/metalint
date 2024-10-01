/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import Ajv from "ajv";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { PartialNotice } from "../results.js"
 * @import { Level } from "../levels.js"
 */

/**
 * L'enrobage du linter **Ajv**.
 *
 * @see https://www.npmjs.com/package/ajv
 */
export default class AjvWrapper extends Wrapper {
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
     * @see https://ajv.js.org/options.html#ajv-options
     */
    #options;

    /**
     * L'éventuelle fonction pour ajouter des formats.
     *
     * @type {Function|undefined}
     * @see https://ajv.js.org/guide/formats.html
     */
    #addFormats;

    /**
     * Le schéma du fichier JSON.
     *
     * @type {Record<string, unknown>}
     */
    #schema;

    /**
     * Crée un enrobage pour le linter **Ajv**.
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
        const { addFormats, schema, ...others } = options;
        this.#options = {
            loadSchema: (uri) =>
                Promise.reject(
                    new Error(
                        `loadSchema() must be implemented to load ${uri}`,
                    ),
                ),
            ...others,
        };
        this.#addFormats = addFormats;
        this.#schema = schema;
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

        try {
            const source = await fs.readFile(file, "utf8");
            const ajv = new Ajv(this.#options);
            if (undefined !== this.#addFormats) {
                this.#addFormats(ajv);
            }
            const validate = await ajv.compileAsync(this.#schema);
            validate(JSON.parse(source));
            if (null === validate.errors) {
                return [];
            }

            return validate.errors
                .map((result) => ({
                    file,
                    linter: "ajv",
                    rule: result.keyword,
                    severity: Severities.ERROR,
                    message: ajv.errorsText([result], { dataVar: "" }),
                }))
                .filter((n) => this.level >= n.severity);
        } catch (err) {
            return [
                {
                    file,
                    linter: "ajv",
                    severity: Severities.FATAL,
                    message: err.message,
                },
            ];
        }
    }
}
