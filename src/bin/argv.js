/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";
import yargs from "yargs";
import {
    normalizeFormatter,
    normalizeLevel,
} from "../core/configuration/normalize.js";
import { FORMATTERS } from "../core/formatter/formatter.js";
import Levels from "../core/levels.js";

/**
 * @typedef {import("../core/formatter/formatter.js").default} TypeofFormatter
 * @typedef {import("../type/index.d.ts").Level} Level
 */

/**
 * @typedef {Object} Argv
 * @property {string[]}                  _         Le paramètres de la ligne de
 *                                                 commande.
 * @property {string}                    config    L'option
 *                                                 <code>--config</code> de la
 *                                                 ligne de commande.
 * @property {boolean|undefined}         fix       L'option <code>--fix</code>
 *                                                 de la ligne de commande.
 * @property {TypeofFormatter|undefined} formatter L'option
 *                                                 <code>--formatter</code> de
 *                                                 la ligne de commande.
 * @property {Level}                     level     L'option <code>--level</code>
 *                                                 de la ligne de commande.
 * @property {boolean}                   help      L'option <code>--help</code>
 *                                                 de la ligne de commande.
 */
/**
 * Extrait, vérifie et normalise les paramètres et les options de la ligne de
 * commande.
 *
 * @param {string[]} argv Les paramètres et les options de la ligne de commande.
 * @returns {Promise<Argv>} Les paramètres et les options normalisés.
 */
export const parse = async function (argv = process.argv.slice(2)) {
    const args = yargs(argv)
        .options({
            c: {
                alias: "config",
                default: ".metalint/metalint.config.js",
                requiresArg: true,
                type: "string",
            },
            f: {
                alias: "formatter",
                choices: FORMATTERS,
                requiresArg: true,
                type: "string",
            },
            fix: {
                alias: "fix",
                type: "boolean",
            },
            l: {
                alias: "level",
                choices: Object.keys(Levels).map((l) => l.toLowerCase()),
                default: "info",
                requiresArg: true,
                type: "string",
            },
            help: {
                alias: "help",
                type: "boolean",
            },
        })
        .help(false)
        .parse();

    return {
        // Ajouter une barre oblique à la fin pour les répertoires.
        _:
            0 === args._.length
                ? ["./"]
                : await Promise.all(
                      args._.map(async (base) => {
                          const stats = await fs.lstat(base);
                          return base + (stats.isDirectory() ? "/" : "");
                      }),
                  ),
        config: args.config,
        fix: args.fix,
        // Ne pas utiliser yargs.coerce() pour convertir les données car cette
        // méthode est incompatible avec yargs.choices().
        // https://github.com/yargs/yargs/issues/1379
        formatter:
            undefined === args.formatter
                ? undefined
                : await normalizeFormatter(args.formatter),
        level: normalizeLevel(args.level),
        help: args.help ?? false,
    };
};
