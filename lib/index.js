/* global require, module */

var wrappers = require("./wrappers");

/**
 * Comparer deux notices. En commançant par le numéro de ligne, puis celui de la
 * colonne.
 *
 * @param notices1 La première notice.
 * @param notices2 La seconde notice.
 * @return Un nombre négatif si la 1<sup>ère</sup> notice est inférieure à la
           2<sup>nd</sup> ; <code>0</code> si elles sont égales ; sinon un
           nombre positif.
 */
var compare = function (notice1, notice2) {
    if (null === notice1.locations) {
        return -1;
    }
    if (null === notice2.locations) {
        return 1;
    }

    for (var i = 0; i < notice1.locations.length &&
                    i < notice2.locations.length; ++i) {
        var locations1 = notice1.locations[i];
        var locations2 = notice2.locations[i];

        var diff = locations1.line - locations2.line;
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
 * Vérifier le code source.
 *
 * @param source  Le code source qui sera vérifié.
 * @param linters Les linters utilisés pour vérifier le code source.
 * @param level   Le niveau de sévérité.
 * @return La liste des notices.
 */
var metalint = function (source, linters, level) {
    var notices = [];

    for (var name in linters) {
        notices = notices.concat(wrappers[name](source, linters[name], level));
    }

    return notices.sort(compare);
}; // metalint()

// Exposer la fonction pour vérifier un répertoire.
module.exports = metalint;
