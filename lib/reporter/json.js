/* global module */

"use strict";

/**
 * Écrire les résultats brut (au format JSON). Avec un verbosité à
 * <code>1</code> : le résultat est indenté.
 *
 * @param {Object} results La liste des résultats regroupés par fichier.
 * @param {Object} writer  Le flux où écrire les résultats.
 * @param {number} verbose Le niveau de verbosité.
 * @return {number} La sévérité la plus élévée des résultats.
 */
let reporter = function (results, writer, verbose) {
    // Afficher l'objet JSON.
    writer.write(JSON.stringify(results, null, 0 === verbose ? 0 : 4));
    writer.write("\n");

    // Déterminer la sévérité la plus élévée des résultats.
    let severity = null;
    for (let file in results) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers).
        if (null === results[file]) {
            continue;
        }
        for (let notice of results[file]) {
            if (null === severity || severity > notice.severity) {
                severity = notice.severity;
            }
        }
    }
    return severity;
}; // reporter()

module.exports = reporter;
