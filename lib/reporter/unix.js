"use strict";

/**
 * Écrire les résultats dans un format simple : une notification par ligne.
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
        let severity = null;
        let first = true;
        for (const file in results) {
            // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans
            // les critères des checkers) ou si aucune notification a été
            // remontée.
            if (null === results[file] || 0 === results[file].length) {
                continue;
            }

            // Séparer les fichiers par une ligne vide.
            if (first) {
                first = false;
            } else {
                writer.write("\n");
            }

            for (const notice of results[file]) {
                // Déterminer la sévérité la plus élévée des résultats.
                if (null === severity || severity > notice.severity) {
                    severity = notice.severity;
                }

                writer.write(file + ":");

                if (0 !== notice.locations.length) {
                    writer.write(notice.locations[0].line.toString() + ":");
                    if ("column" in notice.locations[0]) {
                        writer.write(notice.locations[0].column.toString());
                    }
                } else {
                    writer.write(":");
                }

                writer.write(": " + notice.message);
                if (1 <= verbose) {
                    writer.write(" (" + notice.linter);
                    if (2 <= verbose && null !== notice.rule) {
                        writer.write("." + notice.rule);
                    }
                    writer.write(")");
                }
                writer.write("\n");
            }
        }

        return severity;
    });
}; // reporter()

module.exports = reporter;
