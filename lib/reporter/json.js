"use strict";

/**
 * Écrire les résultats brut (au format JSON). La verbosité est utilisée pour
 * l’indentation, avec :
 * <ul>
 *   <li><code>0</code> : le résultat n’est pas indenté ;
 *   <li><code>1</code> : il est indenté avec une espace ;
 *   <li><code>2</code> : deux espaces sont utilisées ;
 *   <li>...</li>
 * </ul>
 *
 * @param {Promise.<Object>} promise Une promesse retournant la liste des
 *                                   notifications regroupées par fichier.
 * @param {Object}           writer  Le flux où écrire les résultats.
 * @param {number}           verbose Le niveau de verbosité.
 * @return {Promise.<number>} Une promesse retournant la sévérité la plus élévée
 *                            des résultats.
 */
const reporter = function (promise, writer, verbose) {
    return promise.then(function (results) {
        // Afficher l’objet JSON.
        writer.write(JSON.stringify(results, null, verbose));
        writer.write("\n");

        // Déterminer la sévérité la plus élévée des résultats.
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
            }
        }

        return severity;
    });
}; // reporter()

module.exports = reporter;
