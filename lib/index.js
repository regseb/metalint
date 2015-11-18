/* global require, module */

"use strict";

let wrappers = require("./wrappers");

/**
 * Comparer deux notices. En commançant par le numéro de ligne, puis celui de la
 * colonne.
 *
 * @param {Object} notice1 La première notice.
 * @param {Object} notice2 La seconde notice.
 * @return {number} Un nombre négatif si la 1<sup>ère</sup> notice est
 *                  inférieure à la 2<sup>nd</sup> ; <code>0</code> si elles
 *                  sont égales ; sinon un nombre positif.
 */
let compare = function (notice1, notice2) {
    if (null === notice1.locations) {
        return -1;
    }
    if (null === notice2.locations) {
        return 1;
    }

    for (let i = 0; i < notice1.locations.length &&
                    i < notice2.locations.length; ++i) {
        let locations1 = notice1.locations[i];
        let locations2 = notice2.locations[i];

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
}; // compare()

/**
 * Vérifier, avec des linters, un code source.
 *
 * @param {string} source  Le code source qui sera vérifié.
 * @param {Object} linters Les linters utilisés pour vérifier le code source.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Array<Object>} La liste des notifications.
 */
let metalint = function (source, linters, level) {
    let notices = [];

    for (let name in linters) {
        notices = notices.concat(wrappers[name](source, linters[name], level));
    }

    return notices.sort(compare);
}; // metalint()

// Exposer la fonction pour vérifier un répertoire.
module.exports = metalint;
