/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
// Désactiver la règle suivante pour cet import, car elle ne supporte pas la
// propriété "exports" du package.json.
// https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import { Biome } from "@biomejs/js-api/nodejs";
import Levels from "../levels.js";
import Severities from "../severities.js";
import Wrapper from "./wrapper.js";

/**
 * @import { Level } from "../levels.js"
 * @import { Notice, PartialNotice } from "../results.js"
 */

const SEVERITY_MAPPINGS = {
    hint: Severities.INFO,
    information: Severities.INFO,
    warning: Severities.WARN,
    error: Severities.ERROR,
    fatal: Severities.FATAL,
};

/**
 * Renvoie le nombre d'octets que comporterait l'unité de code UTF-16 si elle
 * était représentée en UTF-8.
 *
 * @param {string} codeUnit Le code unit.
 * @returns {number} Le nombre d'octets.
 * @throws {Error} Si le code unit est invalide.
 * @see https://github.com/biomejs/website/blob/main/src/playground/utils.ts#L354
 * @see https://stackoverflow.com/a/73096001/4668057
 */
const getUtf8ByteLength = (codeUnit) => {
    // eslint-disable-next-line unicorn/prefer-code-point
    const code = codeUnit.charCodeAt(0);
    if (128 > code) {
        return 1;
    }
    if (2048 > code) {
        return 2;
    }
    // UTF-16 high surrogate
    if (55_296 <= code && 56_319 >= code) {
        return 4;
    }
    // UTF-16 low surrogate
    if (56_320 <= code && 57_343 >= code) {
        return 0;
    }
    return 3;
};

/**
 * Convertit l'intervalle en décalages d'octets UTF-8 en un intervalle en
 * décalages d'unités de code.
 *
 * @param {number[]} span L'intervalle en octets UTF-8.
 * @param {string}   str  La chaine de caractères.
 * @returns {number[]} L'intervalle en unités de code.
 * @see https://github.com/biomejs/website/blob/main/src/playground/utils.ts#L381
 * @see https://stackoverflow.com/a/73096001/4668057
 */
const spanInBytesToSpanInCodeUnits = ([startInBytes, endInBytes], str) => {
    const spanInCodeUnits = [startInBytes, endInBytes];

    let currCodeUnitIndex = 0;

    // Scan through the string, looking for the start of the substring
    let bytePos = 0;
    while (bytePos < startInBytes && currCodeUnitIndex < str.length) {
        const byteLength = getUtf8ByteLength(str.charAt(currCodeUnitIndex));
        bytePos += byteLength;
        ++currCodeUnitIndex;

        // Make sure to include low surrogate
        if (4 === byteLength && bytePos === startInBytes) {
            ++currCodeUnitIndex;
        }
    }

    // We've found the start, we update the start of spanInCodeUnits,
    spanInCodeUnits[0] = currCodeUnitIndex;

    // Now scan through the following string to find the end
    while (bytePos < endInBytes && currCodeUnitIndex < str.length) {
        const byteLength = getUtf8ByteLength(str.charAt(currCodeUnitIndex));
        bytePos += byteLength;
        ++currCodeUnitIndex;

        // Make sure to include low surrogate
        if (4 === byteLength && bytePos === endInBytes) {
            ++currCodeUnitIndex;
        }
    }

    // We've found the end, we update the end of spanInCodeUnits,
    spanInCodeUnits[1] = currCodeUnitIndex;

    return spanInCodeUnits;
};

/**
 * Convertit une position en ligne et colonne.
 *
 * @param {number[]} lengths  Le tableau des longueurs de chaque ligne.
 * @param {number}   position La position à convertir.
 * @returns {object|undefined} La ligne et la colonne ; ou `undefined` si la
 *                             position est hors limites.
 */
const positionToLineColumn = (lengths, position) => {
    let index = 0;
    let lineStartIndex = 0;
    // Ne pas utiliser un 'for-of', car l'index est utilisé pour le numéro de la
    // ligne.
    // eslint-disable-next-line unicorn/no-for-loop
    for (let line = 0; line < lengths.length; ++line) {
        index += lengths[line];
        if (position < index) {
            return {
                line: line + 1,
                column: position - lineStartIndex + 1,
            };
        }
        lineStartIndex = index;
    }
    return undefined;
};

/**
 * L'enrobage du linter **Biome**.
 *
 * @see https://www.npmjs.com/package/@biomejs/js-api
 */
export default class BiomeJsJsApiWrapper extends Wrapper {
    /**
     * La marque indiquant que le linter est configurable.
     *
     * @type {boolean}
     */
    static configurable = true;

    #options;

    /**
     * L'instance de Biome.
     *
     * @type {Biome}
     */
    #biome;

    /**
     * La clé du projet Biome.
     *
     * @type {number}
     */
    #projectKey;

    /**
     * Crée un enrobage pour le linter **Biome**.
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
        this.#biome = new Biome();
        const openProjectResult = this.#biome.openProject(context.root);
        this.#projectKey = openProjectResult.projectKey;
        this.#biome.applyConfiguration(this.#projectKey, this.#options);
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

        let source = await fs.readFile(file, "utf8");
        const notices = [];

        // Formater le fichier seulement si le formateur est activé.
        // https://github.com/biomejs/biome/issues/7814
        if (this.#options.formatter?.enabled ?? true) {
            const formatted = this.#biome.formatContent(
                this.#projectKey,
                source,
                {
                    filePath: file,
                },
            );
            if (source !== formatted.content) {
                if (this.fix) {
                    source = formatted.content;
                    await fs.writeFile(file, source);
                } else {
                    notices.push({
                        file,
                        linter: "biomejs__js-api",
                        severity: Severities.ERROR,
                        message: "Code style issues found.",
                    });
                }
            }
        }

        // Analyser le fichier seulement si le linter est activé.
        // https://github.com/biomejs/biome/issues/7814
        if (this.#options.linter?.enabled ?? true) {
            const results = this.#biome.lintContent(this.#projectKey, source, {
                filePath: file,
            });
            // Calculer le nombre d'octets de chaque ligne (et ajouter un pour le
            // retour à ligne). https://github.com/biomejs/biome/issues/4035
            const lengths = source.split("\n").map((l) => l.length + 1);
            return results.diagnostics
                .map((diagnostic) => {
                    const span = spanInBytesToSpanInCodeUnits(
                        diagnostic.location.span,
                        source,
                    );
                    const start = positionToLineColumn(lengths, span[0]);
                    const end = positionToLineColumn(lengths, span[1]);

                    return {
                        file,
                        linter: "biomejs__js-api",
                        // Enlever le préfixe "lint/".
                        rule: diagnostic.category?.slice(5),
                        severity: SEVERITY_MAPPINGS[diagnostic.severity],
                        message: diagnostic.description,
                        locations: [
                            {
                                line: start.line,
                                column: start.column,
                                endLine: end.line,
                                endColumn: end.column,
                            },
                        ],
                    };
                })
                .concat(notices)
                .filter((n) => this.level >= n.severity);
        }

        return [];
    }
}
