"use strict";

const fs       = require("fs");
const colors   = require("colors");
const SEVERITY = require("../severity");

/**
 * Écrire une ligne du code source.
 *
 * @param {number}         line    Le numéro de la ligne.
 * @param {Array.<string>} content Toutes les lignes du fichiers.
 * @param {boolean}        active  La marque indiquant si la problème est dans
 *                                 cette ligne.
 * @param {Object}         writer  Le flux où afficher la ligne.
 */
const printCodeSourceLine = function (line, content, active, writer) {
    // Vérifier que le numéro de la ligne demandée existe dans le fichier.
    if (0 < line && line <= content.length) {
        writer.write(colors.black(("     " + line.toString()).slice(-5)) +
                     (active ? "‖" : "|") + " " + content[line - 1] + "\n");
    }
}; // printCodeSourceLine()

/**
 * Écrire le code source proche des lieux où le problème a été trouvé.
 *
 * @param {Array.<Object>} locations Les positions, dans le code source, du
 *                                   problème.
 * @param {Array.<string>} content   Toutes les lignes du fichiers.
 * @param {Object}         writer    Le flux où afficher les lignes incriminées.
 */
const printCodeSource = function (locations, content, writer) {
    const characters = [];
    for (const location of locations) {
        let i;
        for (i = 0; i < characters.length; ++i) {
            if (characters[i].line === location.line) {
                if ("columns" in location) {
                    characters[i].columns.push(location.column);
                    characters[i].columns.sort();
                }
                break;
            }
        }
        if (characters.length === i) {
            characters[i] = {
                "line": location.line,
                "columns": []
            };
            if ("column" in location) {
                characters[i].columns.push(location.column);
                characters[i].columns.sort();
            }
        }
    }
    characters.sort(function (a, b) {
        return a.line - b.line;
    });

    for (let i = 0; i < characters.length; ++i) {
        const line = characters[i].line;
        printCodeSourceLine(line - 2, content, false, writer);
        printCodeSourceLine(line - 1, content, false, writer);
        printCodeSourceLine(line, content, true, writer);
        const columns = characters[i].columns;
        if (0 !== columns.length) {
            let dashs = Array(7 + columns[columns.length - 1]).join("-");
            for (const column of columns) {
                dashs = dashs.substr(0, 6 + column) + "^" +
                        dashs.substr(6 + column + 1);
            }
            writer.write(colors.black(dashs) + "\n");
        }
        printCodeSourceLine(line + 1, content, false, writer);
        printCodeSourceLine(line + 2, content, false, writer);
    }
}; // printCodeSource()

/**
 * Écrire les résultats dans un format adapté pour la console.
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
        for (const file in results) {
            const notices = results[file];
            if (null === notices) {
                if (4 <= verbose) {
                    writer.write(colors.bold(file + ": No checked.") + "\n\n");
                }
                continue;
            }
            if (0 === notices.length) {
                if (3 <= verbose) {
                    writer.write(colors.bold(file + ": 0 notice.") + "\n\n");
                }
                continue;
            }

            const counts = {};
            counts[SEVERITY.FATAL] = 0;
            counts[SEVERITY.ERROR] = 0;
            counts[SEVERITY.WARN] = 0;
            counts[SEVERITY.INFO] = 0;

            for (const notice of notices) {
                // Déterminer la sévérité la plus élévée des résultats.
                if (null === severity || severity > notice.severity) {
                    severity = notice.severity;
                }

                ++counts[notice.severity];
            }

            let line = colors.bold(file) + ": ";
            if (0 < counts[SEVERITY.FATAL]) {
                line += counts[SEVERITY.FATAL].toString() + " fatal";
                if (1 < counts[SEVERITY.FATAL]) {
                    line += "s";
                }
                line += ", ";
            }
            if (0 < counts[SEVERITY.ERROR]) {
                line += counts[SEVERITY.ERROR].toString() + " error";
                if (1 < counts[SEVERITY.ERROR]) {
                    line += "s";
                }
                line += ", ";
            }
            if (0 < counts[SEVERITY.WARN]) {
                line += counts[SEVERITY.WARN].toString() + " warning";
                if (1 < counts[SEVERITY.WARN]) {
                    line += "s";
                }
                line += ", ";
            }
            if (0 < counts[SEVERITY.INFO]) {
                line += counts[SEVERITY.INFO].toString() + " info";
                if (1 < counts[SEVERITY.INFO]) {
                    line += "s";
                }
                line += ", ";
            }
            line = line.slice(0, -2) + ".";
            writer.write(colors.bold(line) + "\n");

            const content = fs.readFileSync(file).toString().split("\n");

            for (const notice of notices) {
                switch (notice.severity) {
                case SEVERITY.FATAL:
                    writer.write(colors.magenta("FATAL")); break;
                case SEVERITY.ERROR:
                    writer.write(colors.red("ERROR")); break;
                case SEVERITY.WARN:
                    writer.write(colors.yellow("WARN ")); break;
                case SEVERITY.INFO:
                    writer.write(colors.blue("INFO ")); break;
                default:
                    writer.write("      ");
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

                printCodeSource(notice.locations, content, writer);

                writer.write("\n");
            }
        }

        return severity;
    });
}; // reporter()

module.exports = reporter;
