/* global module */

"use strict";

/**
 * Écrire les résultats dans un format CSV.
 *
 * @param {Object} results La liste des résultats regroupés par fichier.
 * @param {Object} writer  Le flux où écrire les résultats.
 * @param {number} verbose Le niveau de verbosité.
 * @return {number} La sévérité la plus élévée des résultats.
 * @see https://tools.ietf.org/html/rfc4180
 */
let reporter = function (results, writer, verbose) {
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
    for (let file in results) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers).
        if (null === results[file]) {
            continue;
        }

        for (let notice of results[file]) {
            // Déterminer la sévérité la plus élévée des résultats.
            if (null === severity || severity > notice.severity) {
                severity = notice.severity;
            }

            writer.write("\"" + file.replace(/"/g, "\"\"") + "\",");

            if (null !== notice.locations) {
                writer.write(notice.locations[0].line.toString() + ",");
                if ("column" in notice.locations[0]) {
                    writer.write(notice.locations[0].column.toString());
                }
            } else {
                writer.write(",");
            }

            writer.write(",\"" + notice.message.replace(/"/g, "\"\"") + "\"");
            if (1 <= verbose) {
                writer.write("," + notice.linter);
                if (2 <= verbose) {
                    writer.write(",");
                    if (null !== notice.rule) {
                        writer.write("\"" + notice.rule.replace(/"/g, "\"\"") +
                                     "\"");
                    }
                }
            }
            writer.write("\r\n");
        }
    }

    return severity;
}; // reporter()

module.exports = reporter;
