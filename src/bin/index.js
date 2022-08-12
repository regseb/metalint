#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yargs from "yargs";
import glob from "../core/glob.js";
import normalize from "../core/normalize.js";
import metalint from "../core/index.js";
import SEVERITY from "../core/severity.js";

/**
 * @typedef {import("../types").Checker} Checker
 * @typedef {import("../types").Formatter} Formatter
 */

if (undefined === import.meta.resolve) {

    /**
     * Résous un chemin relatif à partir du module.
     *
     * @param {string} specifier Le chemin relatif vers un fichier ou un
     *                           répertoire.
     * @returns {Promise<string>} Une promesse contenant le chemin absolue vers
     *                            le fichier ou le répertoire.
     * @see https://nodejs.org/api/esm.html#importmetaresolvespecifier-parent
     */
    import.meta.resolve = (specifier) => {
        return Promise.resolve(fileURLToPath(new URL(specifier,
                                                     import.meta.url).href));
    };
}

const argv = yargs(process.argv.slice(2)).options({
    c: {
        alias:       "config",
        default:     ".metalint/metalint.config.js",
        requiresArg: true,
        type:        "string",
    },
    f: {
        alias:       "formatter",
        requiresArg: true,
        type:        "string",
    },
    l: {
        alias:       "level",
        requiresArg: true,
        type:        "string",
    },
    o: {
        alias:       "output",
        requiresArg: true,
        type:        "string",
    },
    p: {
        alias:       "patterns",
        requiresArg: true,
        type:        "array",
    },
    help: {
        alias: "help",
        type:  "boolean",
    },
}).help(false).argv;

/**
 * Vérifie (en appelant des linters) une liste de fichiers.
 *
 * @param {string[]}    files     La liste des fichiers.
 * @param {Checker[]}   checkers  La liste des vérifications faites sur les
 *                                fichiers.
 * @param {string}      root      L'adresse du répertoire où se trouve le
 *                                dossier <code>.metalint/</code>.
 * @param {Formatter[]} reporters La liste des rapporteurs utilisés pour
 *                                afficher les résultats.
 * @returns {Promise<?number>} La sévérité la plus élévée des résultats.
 */
const check = async function (files, checkers, root, reporters) {
    let severity = null;

    const results = await metalint(files, checkers, root);
    for (const [file, notices] of Object.entries(results)) {
        // Déterminer la sévérité la plus élévée des résultats.
        if (null !== notices) {
            for (const notice of notices) {
                if (null === severity || severity > notice.severity) {
                    severity = notice.severity;
                }
            }
        }

        // Afficher les notifications avec chaque rapporteur.
        for (const reporter of reporters) {
            await reporter.notify(file, notices);
        }
    }

    // Attendre tous les rapporteurs.
    await Promise.all(reporters.map((r) => r.finalize(severity)));
    return severity;
};

if (argv.help) {
    process.stdout.write(fs.readFileSync(
        await import.meta.resolve("./help.txt"),
    ));
    process.exit(0);
}

let root = process.cwd();
// Rechercher le fichier de configuration dans le répertoire courant, puis dans
// les parents, grands-parents...
while (!fs.existsSync(path.join(root, argv.config))) {
    // Si on est remonté à la racine.
    if (path.join(root, "..") === root) {
        process.stderr.write("metalint: no such config file.\n");
        process.exit(10);
    }
    root = path.join(root, "..");
}

try {
    // eslint-disable-next-line no-unsanitized/method
    const { default: config } = await import(path.join(root, argv.config));
    const { patterns, checkers, reporters } =
            await normalize(config,
                            root,
                            path.dirname(path.join(root, argv.config)),
                            argv);

    const files = await glob.walk(argv._, patterns, root);

    const severity = await check(files, checkers, root, reporters);
    let code;
    switch (severity) {
        case SEVERITY.FATAL: code = 2; break;
        case SEVERITY.ERROR: code = 1; break;
        default:             code = 0;
    }
    process.exit(code);
} catch (err) {
    process.stderr.write(`metalint: ${err.message}\n`);
    process.stderr.write(`${err.stack}\n`);
    process.exit(11);
}
