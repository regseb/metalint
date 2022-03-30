/**
 * @module
 */

import fs from "node:fs/promises";
import chalk from "chalk";
import SEVERITY from "../severity.js";

/**
 * @typedef {NodeJS.WritableStream} WritableStream
 * @typedef {import("../../types").Notice} Notice
 * @typedef {import("../../types").Location} Location
 */

/**
 * Écrit un message avec un style / couleur.
 *
 * @param {WritableStream} writer  Le flux où afficher le message.
 * @param {string}         message Le message qui sera affiché.
 * @param {string}         [style] Le code du style.
 */
const print = function (writer, message, style) {
    let line;
    if (process.stdout === writer) {
        switch (style) {
            case "BOLD":    line = chalk.bold(message);    break;
            case "MAGENTA": line = chalk.magenta(message); break;
            case "RED":     line = chalk.red(message);     break;
            case "YELLOW":  line = chalk.yellow(message);  break;
            case "BLUE":    line = chalk.blue(message);    break;
            default:        line = message;
        }
    } else {
        line = message;
    }
    writer.write(line);
};

/**
 * Écrit une ligne du code source.
 *
 * @param {number}         line    Le numéro de la ligne.
 * @param {string[]}       content Toutes les lignes du fichiers.
 * @param {boolean}        active  La marque indiquant si la problème est dans
 *                                 cette ligne.
 * @param {WritableStream} writer  Le flux où afficher la ligne.
 */
const printCodeSourceLine = function (line, content, active, writer) {
    // Vérifier que le numéro de la ligne demandée existe dans le fichier.
    if (0 < line && line <= content.length) {
        print(writer, line.toString().padStart(5) + (active ? "‖" : "|"));
        if (0 !== content[line - 1].length) {
            print(writer, ` ${content[line - 1]}`);
        }
        print(writer, "\n");
    }
};

/**
 * Écrit le code source proche des lieux où le problème a été trouvé.
 *
 * @param {Location[]}     locations Les positions, dans le code source, du
 *                                   problème.
 * @param {string[]}       content   Toutes les lignes du fichiers.
 * @param {WritableStream} writer    Le flux où afficher les lignes incriminées.
 */
const printCodeSource = function (locations, content, writer) {
    const characters = [];
    for (const location of locations) {
        let i;
        for (i = 0; i < characters.length; ++i) {
            if (characters[i].line === location.line) {
                if ("column" in location) {
                    characters[i].columns.push(location.column);
                    characters[i].columns.sort();
                }
                break;
            }
        }
        if (characters.length === i) {
            characters[i] = {
                line:    location.line,
                columns: [],
            };
            if ("column" in location) {
                characters[i].columns.push(location.column);
                characters[i].columns.sort();
            }
        }
    }
    characters.sort((a, b) => a.line - b.line);

    for (const { line, columns } of characters) {
        printCodeSourceLine(line - 2, content, false, writer);
        printCodeSourceLine(line - 1, content, false, writer);
        printCodeSourceLine(line, content, true, writer);
        if (0 !== columns.length) {
            let dashs = "-".repeat(6 + columns.at(-1));
            for (const column of columns) {
                dashs = dashs.slice(0, 6 + column) + "^" +
                        dashs.slice(6 + column + 1);
            }
            print(writer, dashs + "\n");
        }
        printCodeSourceLine(line + 1, content, false, writer);
        printCodeSourceLine(line + 2, content, false, writer);
    }
};

/**
 * Le formateur qui écrit les résultats dans un format adapté pour la console.
 */
export const Formatter = class {

    /**
     * Le niveau de sévérité minimum des notifications affichées.
     *
     * @type {number}
     */
    #level;

    /**
     * Le flux où écrire les résultats.
     *
     * @type {WritableStream}
     */
    #writer;

    #showZeroNotice;

    #showNoChecked;

    /**
     * Crée un formateur.
     *
     * @param {number}         level                    Le niveau de sévérité
     *                                                  minimum des
     *                                                  notifications affichées.
     * @param {WritableStream} writer                   Le flux où écrire les
     *                                                  résultats.
     * @param {Object}         options                  Les options du
     *                                                  formateur.
     * @param {boolean}        [options.showZeroNotice] La marque indiquant s'il
     *                                                  faut afficher les
     *                                                  fichiers sans alerte.
     * @param {boolean}        [options.showNoChecked]  Le marque indiquant s'il
     *                                                  faut afficher les
     *                                                  fichiers non-analysés.
     */
    constructor(level, writer, options) {
        this.#level          = level;
        this.#writer         = writer;
        this.#showZeroNotice = options.showZeroNotice ?? false;
        this.#showNoChecked  = options.showNoChecked ?? false;
    }

    /**
     * Affiche les éventuelles notifications d'un fichier.
     *
     * @param {string}      file    Le fichier analysé.
     * @param {?(Notice[])} notices La liste des notifications ou
     *                              <code>null</code>.
     */
    async notify(file, notices) {
        if (null === notices) {
            if (this.#showNoChecked) {
                print(this.#writer, `${file}: No checked.`, "BOLD");
                print(this.#writer, "\n\n");
            }
            return;
        }
        if (!notices.some((n) => this.#level >= n.severity)) {
            if (this.#showZeroNotice) {
                print(this.#writer, `${file}: 0 notice.`, "BOLD");
                print(this.#writer, "\n\n");
            }
            return;
        }

        /** @type {Object<number, number>} */
        const counts = {};
        counts[SEVERITY.FATAL] = 0;
        counts[SEVERITY.ERROR] = 0;
        counts[SEVERITY.WARN] = 0;
        counts[SEVERITY.INFO] = 0;

        for (const notice of notices.filter((n) => this.#level >= n.severity)) {
            counts[notice.severity] += 1;
        }

        let line = file + ": ";
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
        print(this.#writer, line, "BOLD");
        print(this.#writer, "\n");

        // Récupérer le code source du fichier si ce n'est pas un répertoire et
        // s'il existe (il n'est pas dans une archive par exemple).
        let content = null;
        try {
            const stats = await fs.stat(file);
            if (!stats.isDirectory()) {
                const buffer = await fs.readFile(file, "utf8");
                content = buffer.split("\n");
            }
        } catch (err) {
            if ("ENOTDIR" !== err.code) {
                throw err;
            }
        }

        for (const notice of notices.filter((n) => this.#level >= n.severity)) {
            switch (notice.severity) {
                case SEVERITY.FATAL:
                    print(this.#writer, "FATAL", "MAGENTA"); break;
                case SEVERITY.ERROR:
                    print(this.#writer, "ERROR", "RED"); break;
                case SEVERITY.WARN:
                    print(this.#writer, "WARN ", "YELLOW"); break;
                case SEVERITY.INFO:
                    print(this.#writer, "INFO ", "BLUE"); break;
                default:
                    print(this.#writer, "      ");
            }
            print(this.#writer, `: ${notice.message} (${notice.linter}`);
            if (null !== notice.rule) {
                print(this.#writer, `.${notice.rule}`);
            }
            print(this.#writer, ")\n");

            if (null !== content) {
                printCodeSource(notice.locations, content, this.#writer);
            }

            print(this.#writer, "\n");
        }
    }

    /**
     * Finalise l'affichage.
     *
     * @returns {Promise<void>} La promesse indiquant que tous les textes sont
     *                          écrits.
     */
    finalize() {
        return new Promise((resolve) => {
            this.#writer.write("", "utf8", resolve);
        });
    }
};
