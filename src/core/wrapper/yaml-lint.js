/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

// La dépendance "@types/js-yaml" n'est inclue dans la projet "yaml-lint" alors
// qu'elle est nécessaire. "@types/js-yaml" a donc été ajouté dans les
// dépendances de Metalint. https://github.com/rasshofer/yaml-lint/pull/36
import yamlLint from "yaml-lint";
import Levels from "../levels.js";
import Wrapper from "./wrapper.js";

/**
 * @typedef {import("../results.js").PartialNotice} PartialNotice
 * @typedef {import("../levels.js").Level} Level
 */

/**
 * L'enrobage du linter <strong>YAMLLint</strong>.
 *
 * @see https://www.npmjs.com/package/yaml-lint
 */
export default class YAMLLintWrapper extends Wrapper {
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
     * @see https://github.com/rasshofer/yaml-lint#options
     */
    #options;

    /**
     * Crée un enrobage pour le linter <strong>YAMLLint</strong>.
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

        try {
            await yamlLint.lintFile(file, this.#options);
            return [];
        } catch (err) {
            return [
                {
                    file,
                    linter: "yaml-lint",
                    message: err.reason,
                    locations: [
                        {
                            // Augmenter de un le numéro de la ligne et de la
                            // colonne, car YAML Lint commence les numérotations
                            // à zéro.
                            line: err.mark.line + 1,
                            column: err.mark.column + 1,
                        },
                    ],
                },
            ];
        }
    }
}
