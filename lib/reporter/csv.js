/* global module */

"use strict";

/**
 * Protéger une chaîne de caractères en l'entourant de guillemets et en doublant
 * les guillemets.
 *
 * @param {string} value Le texte qui sera protégé.
 * @return {string} Le texte protégé.
 */
const doublequote = function (value) {
    return "\"" + value.replace(/"/g, "\"\"") + "\"";
}; // doublequote()

/**
 * Écrire les résultats dans un format CSV.
 *
 * @param {Promise.<Object>} promise Une promesse retournant la liste des
 *                                   notifications regroupées par fichier.
 * @param {Object}           writer  Le flux où écrire les résultats.
 * @param {number}           verbose Le niveau de verbosité.
 * @return {Promise.<number>} Une promesse retournant la sévérité la plus élévée
 *                            des résultats.
 * @see https://tools.ietf.org/html/rfc4180
 */
const reporter = function (promise, writer, verbose) {
    return promise.then(function (results) {
        // Ecrire la ligne des titres.
        writer.write("file,line,column,message");
        if (1 <= verbose) {
            writer.write(",linter");
            if (2 <= verbose) {
                writer.write(",rule");
            }
        }
        writer.write("\r\n");

        let severity = null;
        for (const file in results) {
            // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans
            // les critères des checkers).
            if (null === results[file]) {
                continue;
            }

            for (const notice of results[file]) {
                // Déterminer la sévérité la plus élévée des résultats.
                if (null === severity || severity > notice.severity) {
                    severity = notice.severity;
                }

                writer.write(doublequote(file) + ",");

                if (0 !== notice.locations.length) {
                    writer.write(notice.locations[0].line.toString() + ",");
                    if ("column" in notice.locations[0]) {
                        writer.write(notice.locations[0].column.toString());
                    }
                } else {
                    writer.write(",");
                }

                writer.write("," + doublequote(notice.message));
                if (1 <= verbose) {
                    writer.write("," + notice.linter);
                    if (2 <= verbose) {
                        writer.write(",");
                        if (null !== notice.rule) {
                            writer.write(doublequote(notice.rule));
                        }
                    }
                }
                writer.write("\r\n");
            }
        }

        return severity;
    });
}; // reporter()

module.exports = reporter;
