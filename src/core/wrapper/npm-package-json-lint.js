/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import { NpmPackageJsonLint } from "npm-package-json-lint";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { PartialNotice } from "../results.js"
 * @import { Level } from "../levels.js"
 */

/**
 * L'enrobage du linter **npm-package-json-lint**.
 *
 * @see https://www.npmjs.com/package/npm-package-json-lint
 */
export default class NpmPackageJSONLintWrapper extends Wrapper {
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
     * @see https://npmpackagejsonlint.org/docs/rules/
     */
    #options;

    /**
     * Crée un enrobage pour le linter **npm-package-json-lint**.
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
        this.#options = options;
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
        const npmPackageJsonLint = new NpmPackageJsonLint({
            // Ne pas utiliser la propriété "patterns" car celle-ci prend un
            // répertoire comme valeur (et y ajoute "/**/package.json").
            packageJsonObject: JSON.parse(source),
            packageJsonFilePath: file,
            config: this.#options,
        });
        const results = npmPackageJsonLint.lint();
        return results.results[0].issues
            .map((result) => ({
                file,
                linter: "npm-package-json-lint",
                rule: result.lintId,
                severity:
                    "warning" === result.severity
                        ? Severities.WARN
                        : Severities.ERROR,
                message: result.lintMessage,
            }))
            .filter((n) => this.level >= n.severity);
    }
}
