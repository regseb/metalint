/**
 * @module index
 */

"use strict";

const fs = require("fs");
const glob = require("./glob");

/**
 * Retourne les résultats des promesses dès qu'elles arrivent, mais en gardant
 * l'ordre.
 *
 * @param {Object.<*,Promise>} promises La liste des promesses.
 * @param {Function}           callback La fonction appelée pour chaque résultat
 *                                      des promesses.
 * @returns {Promise} Une promesse pour signaler la fin.
 */
const wait = function (promises, callback) {
    return new Promise(function (resolve) {
        const results = {};
        Object.keys(promises).forEach(function (key) {
            results[key] = undefined;
            promises[key].then(function (result) {
                results[key] = result;
                for (const subkey in results) {
                    if (undefined === results[subkey]) {
                        break;
                    }
                    callback(subkey, results[subkey]);
                    delete results[subkey];
                }
                if (0 === Object.keys(results).length) {
                    resolve();
                }
            });
        });
    });
};

/**
 * Compare deux notifications. En commançant par le numéro de ligne, puis celui
 * de la colonne.
 *
 * @param {Object} notice1 La première notification.
 * @param {Object} notice2 La seconde notification.
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
 * Vérifie, avec des linters, un fichier.
 *
 * @param {string}         file     Le fichier qui sera vérifié.
 * @param {Array.<Object>} checkers Les checkers (contenant les linters et le
 *                                  niveau de sévérité) utilisés pour vérifier
 *                                  le code source.
 * @returns {Promise.<Array.<Object>>} La liste des notifications.
 */
const check = function (file, checkers) {
    const results = [];

    for (const checker of checkers) {
        for (const name in checker.linters) {
            // Charger l’enrobage du linter et l’utiliser pour vérifier le
            // fichier.
            // TODO Autoriser des enrobages externes.
            const { wrapper } = require("./wrapper/" + name);
            results.push(wrapper(file, checker.level, checker.linters[name]));
        }
    }

    // Regrouper et trier les notifications.
    return Promise.all(results).then(function (notices) {
        return [].concat(...notices).sort(compare);
    });
};

/**
 * Vérifie (en appelant des linters) une liste de fichiers.
 *
 * @param {Array.<string>} files    La liste des fichiers.
 * @param {Array.<Object>} checkers La liste des vérifications faites sur les
 *                                  fichiers.
 * @param {string}         root     L’adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @param {Function}       callback La fonction appelée pour chaque résultat
 *                                  des promesses.
 * @returns {Promise.<number>} La sévérité la plus élévée des résultats.
 */
const metalint = function (files, checkers, root, callback) {
    const promises = {};
    for (const file of files) {
        const directory = fs.lstatSync(file).isDirectory();
        const linters = [];
        for (const checker of checkers) {
            if (glob.test(file, checker.patterns, root, directory)) {
                linters.push({
                    "linters": checker.linters,
                    "level":   checker.level
                });
            }
        }
        if (0 === linters.length) {
            promises[file] = Promise.resolve(null);
        } else {
            promises[file] = check(file, linters);
        }
    }

    // Retourner les résultats et calculer la sévérité.
    return new Promise(function (resolve) {
        let severity = null;
        wait(promises, function (file, notices) {
            if (null !== notices) {
                for (const notice of notices) {
                    // Déterminer la sévérité la plus élévée des résultats.
                    if (null === severity || severity > notice.severity) {
                        severity = notice.severity;
                    }
                }
            }
            callback(file, notices);
        }).then(function () {
            resolve(severity);
        });
    });
};


// Exposer la fonction pour vérifier un code source.
module.exports = metalint;
