/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import Severities from "./severities.js";

/**
 * @import { Severity } from "./severities.js"
 */

/**
 * @typedef {Object} Location Le type d'une position d'une notification.
 * @prop {number} line        Le numéro de la ligne du début.
 * @prop {number} [column]    Le numéro de la colonne du début.
 * @prop {number} [endLine]   Le numéro de la ligne de la fin.
 * @prop {number} [endColumn] Le numéro de la colonne de la fin.
 */

/**
 * @typedef {Object} PartialNotice Le type d'une notification partielle.
 * @prop {string}     file        Le nom du fichier.
 * @prop {string}     linter      Le nom du linter.
 * @prop {string}     [rule]      L'éventuel nom de la règle.
 * @prop {Severity}   [severity]  Le niveau de sévérité (`ERROR` par défaut).
 * @prop {string}     message     Le message de la notification.
 * @prop {Location[]} [locations] Les positions de la notification (aucune
 *                                position par défaut).
 */

/**
 * @typedef {Object} Notice Le type d'une notification.
 * @prop {string}     file      Le nom du fichier.
 * @prop {string}     linter    Le nom du linter.
 * @prop {string}     [rule]    L'éventuel nom de la règle.
 * @prop {Severity}   severity  Le niveau de sévérité.
 * @prop {string}     message   Le message de la notification.
 * @prop {Location[]} locations Les positions de la notification.
 */

/**
 * Compare deux notifications. En commençant par le numéro de la ligne, puis
 * celui de la colonne.
 *
 * @param {Notice} notice1 La première notification.
 * @param {Notice} notice2 La seconde notification.
 * @returns {number} Un nombre négatif si la 1<sup>re</sup> notification est
 *                   inférieure à la 2<sup>de</sup> ; `0` si elles sont égales ;
 *                   sinon un nombre positif.
 */
const compare = function (notice1, notice2) {
    for (
        let i = 0;
        i < notice1.locations.length && i < notice2.locations.length;
        ++i
    ) {
        const locations1 = notice1.locations[i];
        const locations2 = notice2.locations[i];

        let diff = locations1.line - locations2.line;
        if (0 !== diff) {
            return diff;
        }

        diff = (locations1.column ?? -1) - (locations2.column ?? -1);
        if (0 !== diff) {
            return diff;
        }
    }
    return notice1.locations.length - notice2.locations.length;
};

/**
 * Les résultats d'une analyse.
 */
export default class Results {
    /**
     * Les données des résultats.
     *
     * @type {Record<string, Notice[]|undefined>}
     */
    #data;

    /**
     * Crée des résultats pour des fichiers.
     *
     * @param {string[]} files Les noms des fichiers.
     */
    constructor(files) {
        this.#data = Object.fromEntries(files.map((f) => [f, undefined]));
    }

    /**
     * Ajoute des notifications d'un fichier dans les résultats.
     *
     * @param {string}          file    Le nom du fichier.
     * @param {PartialNotice[]} notices Les notifications.
     */
    add(file, notices) {
        // Ajouter un tableau vide dans les données pour indiquer que le fichier
        // a été analysé par au moins un linter.
        if (undefined === this.#data[file]) {
            this.#data[file] = [];
        }
        for (const notice of notices) {
            // Vérifier aussi le fichier de la notification, car il peut être
            // différent du fichier d'origine (qui est peut-être un répertoire
            // ou une archive).
            if (undefined === this.#data[notice.file]) {
                this.#data[notice.file] = [];
            }
            this.#data[notice.file].push({
                file: notice.file,
                linter: notice.linter,
                rule: notice.rule,
                severity: notice.severity ?? Severities.ERROR,
                message: notice.message,
                locations: notice.locations ?? [],
            });
        }
    }

    /**
     * Retourne les résultats en objet.
     *
     * @returns {Record<string, Notice[]|undefined>} Les résultats.
     */
    toObject() {
        // Trier les notifications.
        Object.values(this.#data)
            .filter((r) => undefined !== r)
            .forEach((r) => r.sort(compare));
        return this.#data;
    }
}
