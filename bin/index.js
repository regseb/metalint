#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { walk } from "../lib/glob.js";
import { normalize } from "../lib/normalize.js";
import { metalint } from "../lib/index.js";
import { SEVERITY } from "../lib/severity.js";

/**
 * @typedef {import("../lib/types").Checker} Checker
 * @typedef {import("../lib/types").Formatter} Formatter
 */

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

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
    version: {
        alias: "version",
        type:  "boolean",
    },
}).help(false).version(false).argv;

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
    /** @type {?number} */
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
            reporter.notify(file, notices);
        }
    }

    // Attendre tous les rapporteurs.
    await Promise.all(reporters.map((r) => r.finalize(severity)));
    return severity;
};

if (argv.help) {
    process.stdout.write(fs.readFileSync(path.join(DIRNAME,
                                                   "/../help/index.txt")));
    process.exit(0);
}
if (argv.version) {
    const manifest = JSON.parse(fs.readFileSync(path.join(DIRNAME,
                                                          "/../package.json"),
                                                "utf-8"));
    process.stdout.write("Metalint " + manifest.version + "\n");
    process.exit(0);
}

let root = process.cwd();
// Rechercher le fichier de configuration dans le répertoire courant, puis dans
// les parents.
while (!fs.existsSync(path.join(root, argv.config))) {
    // Si on est remonté à la racine.
    if (path.join(root, "..") === root) {
        process.stderr.write("metalint: no such config file.\n");
        process.exit(10);
    }
    root = path.join(root, "..");
}

import(path.join(root, argv.config)).then(async ({ default: config }) => {
    try {
        const { patterns, checkers, reporters } =
                await normalize(config,
                                root,
                                path.dirname(path.join(root, argv.config)),
                                argv);

        const files = walk(argv._, patterns, root);

        const severity = await check(files, checkers, root, reporters);
        let code;
        switch (severity) {
            case SEVERITY.FATAL: code = 2; break;
            case SEVERITY.ERROR: code = 1; break;
            default:             code = 0;
        }
        process.exit(code);
    } catch (err) {
        process.stderr.write("metalint: " + err.message + "\n");
        process.stderr.write(err.stack + "\n");
        process.exit(11);
    }
}).catch((err) => {
    process.stderr.write("metalint: " + err.message + "\n");
    process.stderr.write(err.stack + "\n");
    process.exit(13);
});
