#!/usr/bin/env node

"use strict";

const fs        = require("fs");
const path      = require("path");
const yargs     = require("yargs");
const glob      = require("../lib/glob");
const normalize = require("../lib/normalize");
const metalint  = require("../lib/index");
const SEVERITY  = require("../lib/severity");

const argv = yargs.options({
    "c": {
        "alias":       "config",
        "default":     ".metalint/metalint.json",
        "requiresArg": true,
        "type":        "string"
    },
    "f": {
        "alias":       "formatter",
        "requiresArg": true,
        "type":        "string"
    },
    "l": {
        "alias":       "level",
        "requiresArg": true,
        "type":        "string"
    },
    "o": {
        "alias":       "output",
        "requiresArg": true,
        "type":        "string"
    },
    "p": {
        "alias":       "patterns",
        "requiresArg": true,
        "type":        "array"
    },
    "help": {
        "alias": "help",
        "type":  "boolean"
    },
    "version": {
        "alias": "version",
        "type":  "boolean"
    }
}).help(false).version(false).parse();

/**
 * Vérifie (en appelant des linters) une liste de fichiers.
 *
 * @param {Array.<string>} files     La liste des fichiers.
 * @param {Array.<object>} checkers  La liste des vérifications faites sur les
 *                                   fichiers.
 * @param {string}         root      L'adresse du répertoire où se trouve le
 *                                   dossier <code>.metalint/</code>.
 * @param {object}         reporters La liste des rapporteurs utilisés pour
 *                                   afficher les résultats.
 * @returns {Promise.<number>} La sévérité la plus élévée des résultats.
 */
const check = async function (files, checkers, root, reporters) {
    const results = await metalint(files, checkers, root);
    let severity = null;
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

    const sweepers = reporters.map((reporter) => {
        reporter.finalize(severity);
        // Attendre que les textes soient écrits.
        return new Promise((resolve) => {
            reporter.writer.write("", resolve);
        });
    });
    // Attendre tous les rapporteurs.
    await Promise.all(sweepers);
    return severity;
};

if (argv.help) {
    process.stdout.write(fs.readFileSync(path.join(__dirname,
                                                   "/../help/index.txt")));
    process.exit(0);
}
if (argv.version) {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname,
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

let config = JSON.parse(fs.readFileSync(path.join(root, argv.config), "utf-8"));
try {
    config = normalize(config,
                       root,
                       path.dirname(path.join(root, argv.config)),
                       argv);
} catch (err) {
    process.stderr.write("metalint: " + err.message);
    process.exit(11);
}

const files = glob.walk(argv._, config.patterns, root);

check(files, config.checkers, root, config.reporters).then((severity) => {
    let code;
    switch (severity) {
        case SEVERITY.FATAL: code = 2; break;
        case SEVERITY.ERROR: code = 1; break;
        default:             code = 0;
    }
    process.exit(code);
}).catch((err) => {
    process.stderr.write("metalint: " + err.message + "\n");
    process.stderr.write(err.stack + "\n");
    process.exit(12);
});
