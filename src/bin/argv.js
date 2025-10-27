/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import process from "node:process";
import { parseArgs } from "node:util";
import {
    normalizeFix,
    normalizeFormatter,
    normalizeLevel,
} from "../core/configuration/normalize.js";

/**
 * @import { TypeofFormatter } from "../core/formatter/formatter.js"
 * @import { Level } from "../core/levels.js"
 */

/**
 * @typedef {Object} Argv
 * @prop {string[]}        bases       Les paramètres de la ligne de commande.
 * @prop {string}          config      L'option `--config` de la ligne de
 *                                     commande.
 * @prop {boolean}         [fix]       L'option `--fix` de la ligne de commande.
 * @prop {TypeofFormatter} [formatter] L'option `--formatter` de la ligne de
 *                                     commande.
 * @prop {Level}           [level]     L'option `--level` de la ligne de
 *                                     commande.
 * @prop {boolean}         help        L'option `--help` de la ligne de
 *                                     commande.
 */

/**
 * Extrait, vérifie et normalise les paramètres et les options de la ligne de
 * commande.
 *
 * @param {string[]} argv Les paramètres et les options de la ligne de commande.
 * @returns {Promise<Argv>} Les paramètres et les options normalisés.
 */
export const parse = async (argv = process.argv) => {
    const { values, positionals } = parseArgs({
        // Enlever les deux premiers arguments de la ligne de commande qui sont
        // "node" et "index.js".
        args: argv.slice(2),
        options: {
            config: {
                type: "string",
                short: "c",
                default: ".metalint/metalint.config.js",
            },
            fix: {
                type: "boolean",
            },
            formatter: {
                type: "string",
                short: "f",
            },
            level: {
                type: "string",
                short: "l",
            },
            help: {
                type: "boolean",
                default: false,
            },
        },
        allowPositionals: true,
    });

    return {
        // Ajouter une barre oblique à la fin pour les répertoires.
        bases:
            0 === positionals.length
                ? ["./"]
                : await Promise.all(
                      positionals.map(async (positional) => {
                          const stats = await fs.lstat(positional);
                          return positional + (stats.isDirectory() ? "/" : "");
                      }),
                  ),
        config: values.config,
        fix: normalizeFix(values.fix),
        formatter:
            undefined === values.formatter
                ? undefined
                : await normalizeFormatter(values.formatter),
        level: normalizeLevel(values.level),
        help: values.help,
    };
};
