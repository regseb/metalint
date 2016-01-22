/* global module */

"use strict";

/**
 * Ne pas écrire les résultats ; retourner seulement la sévérité la plus élévée.
 *
 * @param {Promise.<Object>} promise Une promesse retournant la liste des
 *                                   notifications regroupées par fichier.
 * @return {Promise.<number>} Une promesse retournant la sévérité la plus élévée
 *                            des résultats.
 */
const reporter = function (promise) {
    return promise.then(function (results) {
        let severity = null;
        for (const file in results) {
            // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans
            // les critères des checkers) ou si aucune notice a été remontée.
            if (null === results[file] || 0 === results[file].length) {
                continue;
            }

            for (const notice of results[file]) {
                // Déterminer la sévérité la plus élévée des résultats.
                if (null === severity || severity > notice.severity) {
                    severity = notice.severity;
                }
            }
        }

        return severity;
    });
}; // reporter()

module.exports = reporter;
