/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import Severities from "./severities.js";

/**
 * @typedef {import("../type/index.d.ts").Notice} Notice
 */

/**
 * Compare deux notifications. En commençant par le numéro de la ligne, puis
 * celui de la colonne.
 *
 * @param {Notice} notice1 La première notification.
 * @param {Notice} notice2 La seconde notification.
 * @returns {number} Un nombre négatif si la 1<sup>re</sup> notification est
 *                   inférieure à la 2<sup>de</sup> ; <code>0</code> si elles
 *                   sont égales ; sinon un nombre positif.
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

export default class Results {
    /**
     * Les données des résultats.
     *
     * @type {Record<string, Notice[]|undefined>}
     */
    #data;

    constructor(files) {
        this.#data = Object.fromEntries(files.map((f) => [f, undefined]));
    }

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
                rule: undefined,
                severity: Severities.ERROR,
                locations: [],
                ...notice,
            });
        }
    }

    toObject() {
        // Trier les notifications.
        Object.values(this.#data)
            .filter((r) => undefined !== r)
            .forEach((r) => r.sort(compare));
        return this.#data;
    }
}
