"use strict";

/**
 * Écrire les résultats avec des phrases en français.
 *
 * @param {Promise.<Object>} promise Une promesse retournant la liste des
 *                                   notifications regroupées par fichier.
 * @param {Object}           writer  Le flux où écrire les résultats.
 * @return {Promise.<number>} Une promesse retournant la sévérité la plus élévée
 *                            des résultats.
 */
const reporter = function (promise, writer) {
    return promise.then(function (results) {
        let severity = null;
        for (const file in results) {
            // Si le fichier n’a pas été vérifié (car il ne rentrait pas dans
            // les critères des checkers).
            if (null === results[file]) {
                continue;
            }

            for (const notice of results[file]) {
                // Déterminer la sévérité la plus élévée des résultats.
                if (null === severity || severity > notice.severity) {
                    severity = notice.severity;
                }

                writer.write("Le linter " + notice.linter + " a trouvé ");
                if (null === notice.rule) {
                    writer.write("un problème ");
                } else {
                    writer.write("que la règle " + notice.rule +
                                 " n’est pas respectée ");
                }
                if (0 === notice.locations.length) {
                    writer.write("dans le fichier ");
                } else {
                    writer.write("à la ligne " +
                                 notice.locations[0].line.toString() +
                                 " du fichier ");
                }
                writer.write(file + " : " + notice.message + "\n");
            }
        }

        return severity;
    });
}; // reporter()

module.exports = reporter;
