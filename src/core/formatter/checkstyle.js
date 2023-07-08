/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import process from "node:process";
import Severities from "../severities.js";
import Formatter from "./formatter.js";

/**
 * @typedef {NodeJS.WritableStream} WritableStream
 * @typedef {import("../../type/index.js").Level} Level
 * @typedef {import("../../type/index.js").Notice} Notice
 */

/**
 * Convertit les caractères spéciaux (<em>&amp;</em>, <em>&lt;</em>,
 * <em>&gt;</em>, <em>'</em> et <em>"</em>) en entités.
 *
 * @param {string} input Le texte qui sera converti.
 * @returns {string} Le texte converti.
 */
const encode = function (input) {
    const ENTITIES = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&apos;",
        '"': "&quot;",
    };
    let output = input;
    for (const [character, entity] of Object.entries(ENTITIES)) {
        output = output.replaceAll(character, entity);
    }
    return output;
};

/**
 * Le formateur qui écrit les résultats dans le format de
 * <strong>checkstyle</strong>.
 *
 * @see https://checkstyle.sourceforge.io/
 */
export default class CheckstyleFormatter extends Formatter {
    /**
     * Le flux où écrire les résultats.
     *
     * @type {WritableStream}
     */
    #writer;

    /**
     * La taille des indentations (en espace) ou <code>-1</code> pour ne pas
     * mettre de retour à la ligne.
     *
     * @type {number}
     */
    #indent;

    /**
     * Crée un formateur.
     *
     * @param {Level}          level            Le niveau de sévérité minimum
     *                                          des notifications affichées.
     * @param {Object}         options          Les options du formateur.
     * @param {WritableStream} [options.writer] Le flux où écrire les résultats.
     * @param {number}         [options.indent] La taille des indentations (en
     *                                          espace) ou <code>-1</code> (par
     *                                          défaut) pour ne pas mettre de
     *                                          retour à la ligne.
     */
    constructor(level, options) {
        super(level);
        this.#writer = options.writer ?? process.stdout;
        this.#indent = options.indent ?? -1;

        this.#writer.write('<?xml version="1.0" encoding="UTF-8"?>');
        this.#shift(0);
        this.#writer.write('<checkstyle version="8.28">');
    }

    /**
     * Indente et ajoute des retours à la ligne dans le texte.
     *
     * @param {number} depth La profondeur de l'indentation.
     */
    #shift(depth) {
        if (-1 !== this.#indent) {
            this.#writer.write("\n" + " ".repeat(depth * this.#indent));
        }
    }

    /**
     * Affiche les éventuelles notifications d'un fichier.
     *
     * @param {string}             file    Le fichier analysé.
     * @param {Notice[]|undefined} notices La liste des notifications ou
     *                                     <code>undefined</code>.
     * @returns {Promise<void>} La promesse indiquant que les notifications ont
     *                          été traitées.
     */
    notify(file, notices) {
        // Si le fichier n'a pas été vérifié (car il ne rentrait pas dans les
        // critères des checkers).
        if (undefined === notices) {
            return Promise.resolve();
        }

        this.#shift(1);
        this.#writer.write(`<file name="${encode(file)}">`);
        for (const notice of notices.filter((n) => this.level >= n.severity)) {
            this.#shift(2);
            this.#writer.write("<error");

            if (0 !== notice.locations.length) {
                this.#writer.write(` line="${notice.locations[0].line}"`);
                if (undefined !== notice.locations[0].column) {
                    this.#writer.write(
                        ` column="${notice.locations[0].column}"`,
                    );
                }
            }

            this.#writer.write(' severity="');
            switch (notice.severity) {
                case Severities.FATAL:
                case Severities.ERROR:
                    this.#writer.write("error");
                    break;
                case Severities.WARN:
                    this.#writer.write("warning");
                    break;
                default:
                    this.#writer.write("info");
            }
            this.#writer.write('"');

            this.#writer.write(` message="${encode(notice.message)}"`);

            this.#writer.write(` source="${encode(notice.linter)}`);
            if (undefined !== notice.rule) {
                this.#writer.write(`.${encode(notice.rule)}`);
            }
            this.#writer.write('" />');
        }
        this.#shift(1);
        this.#writer.write("</file>");
        return Promise.resolve();
    }

    /**
     * Finalise les résultats.
     *
     * @returns {Promise<void>} La promesse indiquant que les résultats ont été
     *                          finalisés.
     */
    finalize() {
        this.#shift(0);
        return new Promise((resolve) => {
            this.#writer.write("</checkstyle>\n", () => resolve());
        });
    }
}
