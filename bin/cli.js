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
    "h": {
        "alias":   "hidden",
        "default": undefined,
        "type":    "boolean"
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
    "r": {
        "alias":       "reporter",
        "requiresArg": true,
        "type":        "string"
    },
    "v": {
        "alias":   "verbose",
        "default": undefined,
        "type":    "count"
    },
    "help": {
        "alias": "help",
        "type":  "boolean"
    },
    "version": {
        "alias": "version",
        "type":  "boolean"
    }
}).argv;

/**
 * Vérifier (en appelant des linters) une liste de fichiers.
 *
 * @param {Array.<string>} files    La liste des fichiers.
 * @param {Array.<Object>} checkers La liste des vérifications faites sur les
 *                                  fichiers.
 * @param {string}         root     L’adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @return {Object} Les listes des notifications (regroupées par fichier)
 *                  retournées par les linters.
 */
const check = function (files, checkers, root) {
    const results = {};
    for (const file of files) {
        const linters = [];
        for (const checker of checkers) {
            if (glob.match(file, checker.patterns, checker.hidden, root,
                           process.cwd())) {
                linters.push({
                    "linters": checker.linters,
                    "level":   checker.level
                });
            }
        }
        if (0 === linters.length) {
            results[file] = Promise.resolve(null);
        } else {
            results[file] = metalint(file, linters);
        }
    }

    return Promise.all(Object.keys(results).map(function (file) {
        return results[file].then(function (notices) {
            return { file, notices };
        });
    })).then(function (raws) {
        const obj = {};
        for (const raw of raws) {
            obj[raw.file] = raw.notices;
        }
        return obj;
    });
}; // check()

if (argv.help) {
    process.stdout.write(fs.readFileSync(path.join(__dirname, "/help.txt")));
    process.exit(0);
}
if (argv.version) {
    let manifest = JSON.parse(fs.readFileSync(path.join(__dirname,
                                                        "/../package.json"),
                                              "utf-8"));
    process.stdout.write(manifest.name + " " + manifest.version + "\n\n");

    for (const linter of ["csslint", "eslint", "htmlhint", "htmllint", "jscs",
                          "jshint", "json-lint", "jsonlint", "markdownlint"]) {
        manifest = JSON.parse(fs.readFileSync(path.join(__dirname,
                                                        "/../node_modules/" +
                                                        linter +
                                                        "/package.json"),
                                              "utf-8"));
        process.stdout.write(manifest.name + " " + manifest.version + "\n");
    }
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
for (const key of ["hidden", "level", "output", "patterns", "reporter",
                   "verbose"]) {
    if (undefined !== argv[key]) {
        config[key] = argv[key];
    }
}
try {
    config = normalize(config, path.dirname(path.join(root, argv.config)));
} catch (exc) {
    process.stderr.write("metalint: " + exc.message);
    process.exit(11);
}

const files = glob.walk(0 === argv._.length ? [null]
                                            : argv._,
                        config.patterns, config.hidden, root);
const results = check(files, config.checkers, root);

// Afficher les résultats.
config.reporter(results, config.output,
                         config.verbose).then(function (severity) {
    // Attendre que tous les textes soient écrits avant de retourner le status.
    config.output.write("", function () {
        let exit;
        if (null === severity) {
            exit = 0;
        } else {
            switch (severity) {
                case SEVERITY.FATAL: exit = 2; break;
                case SEVERITY.ERROR: exit = 1; break;
                default:             exit = 0;
            }
        }
        process.exit(exit);
    });
}).catch(function (exc) {
    process.stderr.write("metalint: " + exc.message + "\n");
    process.stderr.write(exc.stack + "\n");
    process.exit(12);
});
