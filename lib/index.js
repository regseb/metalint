/* global Promise, require, module */

"use strict";

/**
 * Comparer deux notices. En commançant par le numéro de ligne, puis celui de la
 * colonne.
 *
 * @param {Object} notice1 La première notice.
 * @param {Object} notice2 La seconde notice.
 * @return {number} Un nombre négatif si la 1<sup>re</sup> notice est
 *                  inférieure à la 2<sup>de</sup> ; <code>0</code> si elles
 *                  sont égales ; sinon un nombre positif.
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
}; // compare()

/**
 * Vérifier, avec des linters, un code source.
 *
 * @param {string} source   Le code source qui sera vérifié.
 * @param {Object} checkers Les checkers (contenant les linters et le niveau de
 *                          sévérité) utilisés pour vérifier le code source.
 * @return {Promise.<Array.<Object>>} La liste des notifications.
 */
const metalint = function (source, checkers) {
    const promises = [];

    for (const checker of checkers) {
        for (const name in checker.linters) {
            const wrapper = require("./wrapper/" + name);
            promises.push(wrapper(source, checker.linters[name],
                                  checker.level));
        }
    }

    // Regrouper et trier les notifications.
    return Promise.all(promises).then(function (notices) {
        return [].concat(...notices).sort(compare);
    });
}; // metalint()

// Exposer la fonction pour vérifier un code source.
module.exports = metalint;
