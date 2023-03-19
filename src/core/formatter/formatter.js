/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * @typedef {import("../../type/index.js").Level} Level
 * @typedef {import("../../type/index.js").Notice} Notice
 */

if (undefined === import.meta.resolve) {
    /**
     * Résous un chemin relatif à partir du module.
     *
     * @param {string} specifier Le chemin relatif vers un fichier ou un
     *                           répertoire.
     * @returns {string} L'URL absolue vers le fichier ou le répertoire.
     * @see https://nodejs.org/api/esm.html#importmetaresolvespecifier-parent
     */
    import.meta.resolve = (specifier) => {
        return new URL(specifier, import.meta.url).href;
    };
}

/**
 * La liste des fichiers JavaScript des formateurs.
 *
 * @constant {string[]} scripts
 */
const scripts = await fs.readdir(fileURLToPath(import.meta.resolve("./")));

/**
 * La liste des noms des formateurs.
 *
 * @constant {string[]} FORMATTERS
 */
export const FORMATTERS = scripts
    // Enlever l'extension du fichier.
    .map((f) => f.slice(0, -3))
    // Enlever ce fichier qui n'est pas un vrai formateur.
    .filter((f) => "formatter" !== f);

/**
 * Le formateur parent.
 */
export default class Formatter {
    /**
     * Le niveau de sévérité minimum des notifications affichées.
     *
     * @type {Level}
     */
    #level;

    /**
     * Crée un formateur.
     *
     * @param {Level} level Le niveau de sévérité minimum des notifications
     *                      affichées.
     */
    constructor(level) {
        this.#level = level;
    }

    /**
     * Retourne le niveau de sévérité minimum des notifications affichées.
     *
     * @returns {Level} Le niveau de sévérité.
     */
    get level() {
        return this.#level;
    }

    /**
     * Traite les notifications d'un fichier analysé.
     *
     * @param {string}             _file    Le fichier analysé.
     * @param {Notice[]|undefined} _notices La liste des notifications ou
     *                                      <code>undefined</code>.
     * @returns {Promise<void>} La promesse indiquant que les notifications ont
     *                          été traitées.
     */
    // eslint-disable-next-line class-methods-use-this
    notify(_file, _notices) {
        return Promise.resolve();
    }

    /**
     * Finalise les résultats.
     *
     * @returns {Promise<void>} La promesse indiquant que les résultats ont été
     *                          finalisés.
     */
    // eslint-disable-next-line class-methods-use-this
    finalize() {
        return Promise.resolve();
    }
}
