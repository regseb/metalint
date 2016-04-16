/* global require, module */

"use strict";

const SEVERITY = require("../severity");

/**
 * Convertir les caractères spéciaux (<em>&amp;</em>, <em>&lt;</em>,
 * <em>&gt;</em>, <em>'</em> et <em>"</em>) en entités.
 *
 * @param {string} input Le texte qui sera converti.
 * @return {string} Le texte converti.
 */
const encode = function (input) {
    const ENTITIES = {
        "&":  "&amp;",
        "<":  "&lt;",
        ">":  "&gt;",
        "'":  "&apos;",
        "\"": "&quot;"
    };
    let output = input;
    for (const entity in ENTITIES) {
        output = output.replace(new RegExp(entity, "g"), ENTITIES[entity]);
    }
    return output;
}; // encode()

/**
 * Indenter le texte si le niveau de verbosité est supérieure ou égal à
 * <code>1</code>.
 *
 * @param {number} depth   La profondeur de l'indentation.
 * @param {Object} writer  Le flux où écrire l'indentation.
 * @param {number} verbose Le niveau de verbosité.
 */
const indent = function (depth, writer, verbose) {
    if (0 === verbose) {
        return;
    }
    writer.write("\n" + Array(depth * 2 + 1).join(" "));
}; // indent()

/**
 * Écrire les résultats dans le format de <strong>checkstyle</strong>. Avec une
 * verbosité à <code>1</code> : le résultat est indenté.
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
        writer.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        indent(0, writer, verbose);
        writer.write("<checkstyle version=\"6.8\">");
        for (const file in results) {
            // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans
            // les critères des checkers).
            if (null === results[file]) {
                continue;
            }

            indent(1, writer, verbose);
            writer.write("<file name=\"" + file + "\">");
            for (const notice of results[file]) {
                // Déterminer la sévérité la plus élévée des résultats.
                if (null === severity || severity > notice.severity) {
                    severity = notice.severity;
                }

                indent(2, writer, verbose);
                writer.write("<error");

                if (0 !== notice.locations.length) {
                    writer.write(" line=\"" + notice.locations[0].line + "\"");
                    if ("column" in notice.locations[0]) {
                        writer.write(" column=\"" + notice.locations[0].column +
                                     "\"");
                    }
                }

                writer.write(" severity=\"");
                switch (notice.severity) {
                    case SEVERITY.FATAL: writer.write("error");   break;
                    case SEVERITY.ERROR: writer.write("error");   break;
                    case SEVERITY.WARN:  writer.write("warning"); break;
                    case SEVERITY.INFO:  writer.write("info");    break;
                }
                writer.write("\"");

                writer.write(" message=\"" + encode(notice.message) + "\"");

                writer.write(" source=\"" + encode(notice.linter));
                if (null !== notice.rule) {
                    writer.write("." + encode(notice.rule));
                }
                writer.write("\" />");
            }
            indent(1, writer, verbose);
            writer.write("</file>");
        }
        indent(0, writer, verbose);
        writer.write("</checkstyle>\n");

        return severity;
    });
}; // reporter()

module.exports = reporter;
