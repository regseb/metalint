#!/usr/bin/env node

"use strict";

const fs        = require("fs");
const path      = require("path");
const yargs     = require("yargs");
const glob      = require("../lib/glob");
const normalize = require("../lib/normalize");
const metalint  = require("../lib/index");
const SEVERITY  = require("../lib/severity");

// TODO Ajouter l'option --formatter pour surcharger le formateur du premier
//      rapporteur et désactiver les autres.
// TODO Ajouter l'option --output pour surcharger le fichier de sortie du
//      premier rapporteur et désactiver les autres.
// TODO Ajouter l'option --fix (et dans la configuration) pour corriger
//      certaines erreurs.
// TODO Ajouter une option (et dans la configuration) pour analyser seulement
//      les modifications (git status).
const argv = yargs.options({
    "c": {
        "alias":       "config",
        "default":     ".metalint/metalint.json",
        "requiresArg": true,
        "type":        "string"
    },
    "l": {
        "alias":       "level",
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
 * @param {Array.<Object>} checkers  La liste des vérifications faites sur les
 *                                   fichiers.
 * @param {string}         root      L’adresse du répertoire où se trouve le
 *                                   dossier <code>.metalint/</code>.
 * @param {Object}         reporters La liste des rapporteurs utilisés pour
 *                                   afficher les résultats.
 * @returns {Promise.<number>} La sévérité la plus élévée des résultats.
 */
const check = function (files, checkers, root, reporters) {
    return metalint(files, checkers, root).then(function (results) {
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

        const sweepers = [];
        for (const reporter of reporters) {
            reporter.finalize(severity);
            // Attendre que les textes soient écrits.
            sweepers.push(new Promise(function (resolve) {
                reporter.writer.write("", resolve);
            }));
        }
        // Attendre tous les rapporteurs.
        return Promise.all(sweepers).then(() => severity);
    });
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
// Rechercher le fichier de configuration dans le répertoire courant, puis les
// parents.
while (!fs.existsSync(path.join(root, argv.config))) {
    // Si on est remonté à la racine.
    if (path.join(root, "..") === root) {
        process.stderr.write("metalint: no such config file.\n");
        process.exit(10);
    }
    root = path.join(root, "..");
}

let config = JSON.parse(fs.readFileSync(path.join(root, argv.config), "utf-8"));
// Surcharger les données du fichier de configuration par les paramètres de la
// ligne de commande.
for (const key of ["level", "patterns"]) {
    if (undefined !== argv[key]) {
        config[key] = argv[key];
    }
}
try {
    config = normalize(config, root,
                       path.dirname(path.join(root, argv.config)));
} catch (exc) {
    process.stderr.write("metalint: " + exc.message);
    process.exit(11);
}

const files = glob.walk(argv._, config.patterns, root);

check(files, config.checkers, root, config.reporters).then(function (severity) {
    let code;
    switch (severity) {
        case SEVERITY.FATAL: code = 2; break;
        case SEVERITY.ERROR: code = 1; break;
        default:             code = 0;
    }
    process.exit(code);
}).catch(function (exc) {
    process.stderr.write("metalint: " + exc.message + "\n");
    process.stderr.write(exc.stack + "\n");
    process.exit(12);
});
