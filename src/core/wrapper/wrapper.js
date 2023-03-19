/**
 * @module
 * @license MIT
 * @see https://www.npmjs.com/package/purgecss
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * @typedef {import("../../type/index.d.ts").Level} Level
 * @typedef {import("../../type/index.d.ts").PartialNotice} PartialNotice
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
 * La liste des fichiers JavaScript des enrobages.
 *
 * @constant {string[]} scripts
 */
const scripts = await fs.readdir(fileURLToPath(import.meta.resolve("./")));

/**
 * La liste des noms des enrobages.
 *
 * @constant {string[]} WRAPPERS
 */
export const WRAPPERS = scripts
    // Enlever l'extension du fichier.
    .map((f) => f.slice(0, -3))
    // Enlever ce fichier qui n'est pas un vrai enrobage.
    .filter((f) => "wrapper" !== f);

/**
 * La classe mère des enrobages de linters.
 */
export default class Wrapper {
    /**
     * Le niveau de sévérité minimum des notifications retournées.
     *
     * @type {Level}
     */
    #level;

    /**
     * La marque indiquant s'il faut corriger les fichiers.
     *
     * @type {boolean}
     */
    #fix;

    /**
     * L'adresse du répertoire où se trouve le répertoire
     * <code>.metalint/</code>.
     *
     * @type {string}
     */
    #root;

    /**
     * La liste des fichiers analysés.
     *
     * @type {string[]}
     */
    #files;

    /**
     * Crée un enrobage pour un linter.
     *
     * @param {Object}   context       Le contexte de l'enrobage.
     * @param {Level}    context.level Le niveau de sévérité minimum des
     *                                 notifications retournées.
     * @param {boolean}  context.fix   La marque indiquant s'il faut corriger le
     *                                 fichier.
     * @param {string}   context.root  L'adresse du répertoire où se trouve le
     *                                 répertoire <code>.metalint/</code>.
     * @param {string[]} context.files La liste de tous les fichiers analysés.
     */
    constructor({ level, fix, root, files }) {
        this.#level = level;
        this.#fix = fix;
        this.#root = root;
        this.#files = files;
    }

    /**
     * Retourne le niveau de sévérité minimum des notifications retournées.
     *
     * @returns {Level} Le niveau de sévérité minimum des notifications
     *                  retournées.
     */
    get level() {
        return this.#level;
    }

    /**
     * Retourne la marque indiquant s'il faut corriger les fichiers.
     *
     * @returns {boolean} La marque indiquant s'il faut corriger les fichiers.
     */
    get fix() {
        return this.#fix;
    }

    /**
     * Retourne l'adresse du répertoire où se trouve le répertoire
     * <code>.metalint/</code>.
     *
     * @returns {string} L'adresse du répertoire où se trouve le répertoire
     *                   <code>.metalint/</code>.
     */
    get root() {
        return this.#root;
    }

    /**
     * Retourne la liste des fichiers analysés.
     *
     * @returns {string[]} La liste des fichiers analysés.
     */
    get files() {
        return this.#files;
    }

    /**
     * Vérifie un fichier.
     *
     * @param {string} _file Le fichier qui sera vérifié.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    // eslint-disable-next-line class-methods-use-this
    lint(_file) {
        return Promise.resolve([]);
    }
}
