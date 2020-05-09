/**
 * @module
 */

"use strict";

const fs       = require("fs");
const glob     = require("./glob");
const SEVERITY = require("./severity");

/**
 * Compare deux notifications. En commançant par le numéro de ligne, puis celui
 * de la colonne.
 *
 * @param {object}         notice1           La première notification.
 * @param {Array.<object>} notice1.locations Les coordonnées de la première
 *                                           notification.
 * @param {object}         notice2           La seconde notification.
 * @param {Array.<object>} notice2.locations Les coordonnées de la seconde
 *                                           notification.
 * @returns {number} Un nombre négatif si la 1<sup>re</sup> notification est
 *                   inférieure à la 2<sup>de</sup> ; <code>0</code> si elles
 *                   sont égales ; sinon un nombre positif.
 */
const compare = function (notice1, notice2) {
    for (let i = 0; i < notice1.locations.length &&
                    i < notice2.locations.length; ++i) {
        const locations1 = notice1.locations[i];
        const locations2 = notice2.locations[i];

        let diff = locations1.line - locations2.line;
        if (0 !== diff) {
            return diff;
        }

        diff = ("column" in locations1 ? locations1.column : -1) -
               ("column" in locations2 ? locations2.column : -1);
        if (0 !== diff) {
            return diff;
        }
    }
    return notice1.locations.length - notice2.locations.length;
};

/**
 * Vérifie (en appelant des linters) une liste de fichiers.
 *
 * @param {Array.<string>} files    La liste des fichiers.
 * @param {Array.<object>} checkers La liste des vérifications faites sur les
 *                                  fichiers.
 * @param {string}         root     L'adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @returns {Promise.<object>} Une promesse retournant la liste des
 *                             notifications regrouper par fichier.
 */
const metalint = async function (files, checkers, root) {
    const results = {};

    const promises = [];
    for (const file of files) {
        results[file] = null;

        const directory = fs.lstatSync(file).isDirectory();
        for (const checker of checkers) {
            if (glob.test(file, checker.patterns, root, directory)) {
                results[file] = [];
                for (const [name, linter] of Object.entries(checker.linters)) {
                    // Charger l'enrobage du linter et l'utiliser pour vérifier
                    // le fichier.
                    const { wrapper } = require(name);
                    promises.push(wrapper(file, checker.level, linter, root));
                }
            }
        }
    }

    for await (const notices of promises) {
        for (const notice of [].concat(...notices)) {
            // Ajouter les propriétés par défaut.
            if (!("rule" in notice)) {
                notice.rule = null;
            }
            if (!("severity" in notice)) {
                notice.severity = SEVERITY.ERROR;
            }
            if (!("locations" in notice)) {
                notice.locations = [];
            }

            // Regrouper les notifications par fichiers.
            if (!(notice.file in results) || null === results[notice.file]) {
                results[notice.file] = [notice];
            } else {
                results[notice.file].push(notice);
            }
        }
    }
    // Trier les notifications.
    Object.values(results).filter((r) => null !== r)
                          .forEach((r) => r.sort(compare));

    return results;
};

// Exposer la fonction pour vérifier un code source.
module.exports = metalint;
