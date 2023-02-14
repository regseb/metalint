/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import glob from "./glob.js";

/**
 * @typedef {import("../types").Notice} Notice
 * @typedef {import("../types").Checker} Checker
 */

/**
 * Compare deux notifications. En commançant par le numéro de ligne, puis celui
 * de la colonne.
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

/**
 * Vérifie (en appelant des linters) une liste de fichiers.
 *
 * @param {string[]}  files    La liste des fichiers.
 * @param {Checker[]} checkers La liste des vérifications faites sur les
 *                             fichiers.
 * @param {string}    root     L'adresse du répertoire où se trouve le dossier
 *                             <code>.metalint/</code>.
 * @returns {Promise<Object>} Une promesse retournant la liste des notifications
 *                            regrouper par fichier.
 */
export default async function metalint(files, checkers, root) {
    const results = {};

    const wraps = [];
    for (const file of files) {
        results[file] = undefined;

        for (const checker of checkers) {
            if (glob.test(file, checker.patterns, root)) {
                results[file] = [];
                for (const [name, linter] of Object.entries(checker.linters)) {
                    // Charger l'enrobage du linter et l'utiliser pour vérifier
                    // le fichier.
                    // eslint-disable-next-line no-unsanitized/method
                    const { wrapper } = await import(name);
                    wraps.push(
                        await wrapper(file, linter, {
                            level: checker.level,
                            fix: checker.fix,
                            root,
                        }),
                    );
                }
            }
        }
    }

    for (const notices of wraps) {
        for (const notice of notices.flat()) {
            // Regrouper les notifications par fichiers.
            if (undefined === results[notice.file]) {
                results[notice.file] = [notice];
            } else {
                results[notice.file].push(notice);
            }
        }
    }
    // Trier les notifications.
    Object.values(results)
        .filter((r) => undefined !== r)
        .forEach((r) => r.sort(compare));

    return results;
}
