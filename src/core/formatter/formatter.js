/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * @import { Level } from "../levels.js"
 * @import { Notice } from "../results.js"
 */

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
    // Garder seulement les fichiers JavaScript et enlever le fichier
    // "formatter.js" qui n'est pas un vrai formateur.
    .filter((f) => f.endsWith(".js") && "formatter.js" !== f)
    // Enlever l'extension des fichiers.
    .map((f) => f.slice(0, -3));

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
     * @param {string}   _file      Le fichier analysé.
     * @param {Notice[]} [_notices] La liste des notifications ou `undefined`.
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

/**
 * @typedef {Object} TypeofFormatter Le type d'un formateur.
 * @prop {Function} constructor La fonction pour créer le formateur.
 */
