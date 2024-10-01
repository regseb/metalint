/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import process from "node:process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
    normalizeFix,
    normalizeFormatter,
    normalizeLevel,
} from "../core/configuration/normalize.js";
import { FORMATTERS } from "../core/formatter/formatter.js";
import Levels from "../core/levels.js";

/**
 * @import { Level } from "../core/levels.js"
 * @import { TypeofFormatter } from "../core/formatter/formatter.js"
 */

/**
 * @typedef {Object} Argv
 * @prop {string[]}        _           Les paramètres de la ligne de commande.
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
export const parse = async function (argv = hideBin(process.argv)) {
    // Désactiver cette règle, car il y a un faux-positif avec la méthode
    // yargs.parseSync().
    // eslint-disable-next-line n/no-sync
    const args = yargs(argv)
        .options({
            config: {
                alias: "c",
                default: ".metalint/metalint.config.js",
                requiresArg: true,
                type: "string",
            },
            fix: {
                type: "boolean",
            },
            formatter: {
                alias: "f",
                choices: FORMATTERS,
                requiresArg: true,
                type: "string",
            },
            level: {
                alias: "l",
                choices: Object.keys(Levels).map((l) => l.toLowerCase()),
                default: undefined,
                requiresArg: true,
                type: "string",
            },
            help: {
                default: false,
                type: "boolean",
            },
        })
        .help(false)
        .parseSync();

    return {
        // Ajouter une barre oblique à la fin pour les répertoires.
        _:
            0 === args._.length
                ? ["./"]
                : await Promise.all(
                      args._.map(async (base) => {
                          const stats = await fs.lstat(base.toString());
                          return (
                              base.toString() + (stats.isDirectory() ? "/" : "")
                          );
                      }),
                  ),
        config: args.config,
        fix: normalizeFix(args.fix),
        // Ne pas utiliser yargs.coerce() pour convertir les données, car cette
        // méthode est incompatible avec yargs.choices().
        // https://github.com/yargs/yargs/issues/1379
        formatter:
            undefined === args.formatter
                ? undefined
                : await normalizeFormatter(args.formatter),
        level: normalizeLevel(args.level),
        help: args.help,
    };
};
