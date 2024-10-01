/**
 * @module
 * @license MIT
 * @see https://www.npmjs.com/package/purgecss
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * @import { PartialNotice } from "../results.js"
 * @import { Level } from "../levels.js"
 */

/**
 * @typedef {Object} WrapperContext Le type du contexte de l'enrobage.
 * @prop {Level}    level Le niveau de sévérité minimum des notifications
 *                        retournées.
 * @prop {boolean}  fix   La marque indiquant s'il faut corriger le fichier.
 * @prop {string}   root  L'adresse du répertoire où se trouve le répertoire
 *                        `.metalint/`.
 * @prop {string[]} files La liste de tous les fichiers analysés.
 */

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
    // Garder seulement les fichiers JavaScript et enlever le fichier
    // "wrapper.js" qui n'est pas un vrai enrobage.
    .filter((f) => f.endsWith(".js") && "wrapper.js" !== f)
    // Enlever l'extension des fichiers.
    .map((f) => f.slice(0, -3));

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
     * L'adresse du répertoire où se trouve le répertoire `.metalint/`.
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
     * @param {WrapperContext} context Le contexte de l'enrobage.
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
     * Retourne l'adresse du répertoire où se trouve le répertoire `.metalint/`.
     *
     * @returns {string} L'adresse du répertoire où se trouve le répertoire
     *                   `.metalint/`.
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
     * Analyse un fichier ou un répertoire. Cette méthode doit être implémentée
     * par les enrobages des linters héritant de cette classe.
     *
     * @param {string} _file Le fichier ou le répertoire qui sera analysé.
     * @returns {Promise<PartialNotice[]>} Une promesse retournant la liste des
     *                                     notifications.
     */
    // eslint-disable-next-line class-methods-use-this
    lint(_file) {
        return Promise.resolve([]);
    }
}

/**
 * @typedef {Object} TypeofWrapper Le type d'un enrobage.
 * @prop {boolean}  configurable La marque indiquant si le linter est
 *                               configurable.
 * @prop {Function} constructor  La fonction pour créer l'enrobage.
 */
