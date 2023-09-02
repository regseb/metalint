#!/usr/bin/env node

// Désactiver cette règle, car elle ne supporte pas les valeurs de la propriété
// "files" (du package.json) commençant par "./".
// https://github.com/eslint-community/eslint-plugin-n/issues/99
// eslint-disable-next-line n/no-unpublished-bin
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import flatten from "../core/configuration/flatten.js";
import normalize from "../core/configuration/normalize.js";
import metalint from "../core/index.js";
import Severities from "../core/severities.js";
import { exists } from "../core/utils/file.js";
import Glob from "../core/utils/glob.js";
import { parse } from "./argv.js";

/**
 * @typedef {import("../core/formatter/formatter.js")} Formatter
 * @typedef {import("../type/index.d.ts").FlattenedConfigChecker} FlattenedConfigChecker
 * @typedef {import("../type/index.d.ts").FlattenedConfigReporter} FlattenedConfigReporter
 * @typedef {import("../type/index.d.ts").Severity} Severity
 */

if (undefined === import.meta.resolve) {
    /**
     * Résous un chemin relatif à partir du module.
     *
     * @param {string} specifier Le chemin relatif vers un fichier ou un
     *                           répertoire.
     * @returns {string} L'URL absolue vers le fichier ou le répertoire.
     * @see https://nodejs.org/api/esm.html#importmetaresolvespecifier-parent
     */
    import.meta.resolve = (specifier) => {
        return new URL(specifier, import.meta.url).href;
    };
}

/**
 * Vérifie (en appelant des linters) une liste de fichiers.
 *
 * @param {string[]}                  files     La liste des fichiers.
 * @param {FlattenedConfigChecker[]}  checkers  La liste des vérifications
 *                                              faites sur les fichiers.
 * @param {string}                    root      L'adresse du répertoire où se
 *                                              trouve le répertoire
 *                                              <code>.metalint/</code>.
 * @param {FlattenedConfigReporter[]} reporters La liste des rapporteurs
 *                                              utilisés pour afficher les
 *                                              résultats.
 * @returns {Promise<Severity|undefined>} La sévérité la plus élevée des
 *                                        résultats.
 */
const check = async function (files, checkers, root, reporters) {
    let severity;

    const formatters = reporters.map((reporter) => {
        // eslint-disable-next-line new-cap
        return new reporter.formatter(reporter.level, reporter.options);
    });
    const results = await metalint(files, checkers, root);
    for (const [file, notices] of Object.entries(results)) {
        // Déterminer la sévérité la plus élevée des résultats.
        if (undefined !== notices) {
            for (const notice of notices) {
                if (undefined === severity || severity > notice.severity) {
                    severity = notice.severity;
                }
            }
        }

        // Afficher les notifications avec chaque rapporteur.
        for (const formatter of formatters) {
            await formatter.notify(file, notices);
        }
    }

    // Attendre tous les rapporteurs.
    await Promise.all(formatters.map((f) => f.finalize()));
    return severity;
};

const argv = await parse();
if (argv.help) {
    process.stdout.write(
        await fs.readFile(fileURLToPath(import.meta.resolve("./help.txt"))),
    );
    process.exit(0);
}

let root = process.cwd();
// Rechercher le fichier de configuration dans le répertoire courant, puis dans
// les parents, grands-parents...
while (!(await exists(path.join(root, argv.config)))) {
    // Si on est remonté à la racine.
    if (path.join(root, "..") === root) {
        process.stderr.write("metalint: no such config file.\n");
        process.exit(10);
    }
    root = path.join(root, "..");
}

try {
    // eslint-disable-next-line no-unsanitized/method
    const { default: config } = await import(
        pathToFileURL(path.join(root, argv.config))
    );
    const { patterns, reporters, checkers } = flatten(
        await normalize(config, {
            dir: path.dirname(path.join(root, argv.config)),
        }),
        argv,
    );

    const glob = new Glob(patterns, { root });
    const files = [];
    for (const base of argv._) {
        files.push(...(await glob.walk(base)));
    }

    const severity = await check(files, checkers, root, reporters);
    let code;
    switch (severity) {
        case Severities.FATAL:
            code = 2;
            break;
        case Severities.ERROR:
            code = 1;
            break;
        default:
            code = 0;
    }
    process.exit(code);
} catch (err) {
    process.stderr.write(`metalint: ${err.message}\n`);
    process.stderr.write(`${err.stack}\n`);
    process.exit(11);
}
