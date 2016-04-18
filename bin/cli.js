#!/usr/bin/env node

/* global Promise, require, process, __dirname */

"use strict";

const fs        = require("fs");
const path      = require("path");
const yargs     = require("yargs");
const glob      = require("../lib/glob");
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
 * Normaliser la configuration. La structure de l'objet JSON contenant la
 * configuration est souple pour rendre le fichier moins verbeuse. Cette
 * fonction renseigne les valeurs par défaut pour les propriétes non-présentes.
 *
 * @param {Object} rotten L'objet JSON contenant la configuration.
 * @param {string} dir    Le répertoire où se trouve le fichier de
 *                        configuration.
 * @return {Object} L'objet JSON normalisé.
 */
const normalize = function (rotten, dir) {
    const standard = {};
    if (!("patterns" in rotten)) {
        standard.patterns = ["**"];
    } else if ("string" === typeof rotten.patterns) {
        standard.patterns = [rotten.patterns];
    } else if (Array.isArray(rotten.patterns)) {
        standard.patterns = rotten.patterns;
    } else {
        throw new Error("'patterns': incorrect type.");
    }

    if (!("hidden" in rotten)) {
        standard.hidden = false;
    } else if ("boolean" === typeof rotten.hidden) {
        standard.hidden = rotten.hidden;
    } else {
        throw new Error("'hidden' incorrect type.");
    }

    if (!("level" in rotten)) {
        standard.level = SEVERITY.INFO;
    } else if ("string" === typeof rotten.level) {
        if (rotten.level in SEVERITY) {
            standard.level = SEVERITY[rotten.level];
        } else {
            throw new Error("'level' unkonwn.");
        }
    } else {
        throw new Error("'level' incorrect type.");
    }

    if (!("reporter" in rotten)) {
        standard.reporter = require("../lib/reporter/console");
    } else if ("string" === typeof rotten.reporter) {
        if (-1 !== ["checkstyle", "console", "csv",
                    "json", "none", "unix"].indexOf(rotten.reporter)) {
            standard.reporter = require("../lib/reporter/" + rotten.reporter);
        } else {
            standard.reporter = require(path.join(process.cwd(),
                                                  rotten.reporter));
        }
    } else {
        throw new Error("'reporter' incorrect type.");
    }

    if (!("verbose" in rotten)) {
        standard.verbose = 0;
    } else if ("number" === typeof rotten.verbose) {
        standard.verbose = rotten.verbose;
    } else {
        throw new Error("'reporter' incorrect type.");
    }

    if (!("output" in rotten) || null === rotten.output) {
        standard.output = process.stdout;
    } else if ("string" === typeof rotten.output) {
        try {
            standard.output = fs.createWriteStream(rotten.output,
                                                   { "flags": "w" });
        } catch (exc) {
            throw new Error("'output' don't writable.");
        }
    } else {
        throw new Error("'output' incorrect type.");
    }

    standard.checkers = rotten.checkers.map(function (checker) {
        const checkest = {};
        if (!("patterns" in checker)) {
            checkest.patterns = ["**"];
        } else if ("string" === typeof checker.patterns) {
            checkest.patterns = [checker.patterns];
        } else if (Array.isArray(checker.patterns)) {
            checkest.patterns = checker.patterns;
        } else {
            throw new Error("'cherkers[].patterns' incorrect type.");
        }

        if (!("hidden" in checker)) {
            checkest.hidden = standard.hidden;
        } else if ("boolean" === typeof rotten.hidden) {
            standard.hidden = rotten.hidden;
        } else {
            throw new Error("'checkers[].hidden' incorrect type.");
        }

        if (!("level" in checker)) {
            checkest.level = standard.level;
        } else if ("string" === typeof checker.level) {
            if (checker.level in SEVERITY) {
                checkest.level = SEVERITY[checker.level];
                if (checkest.level > standard.level) {
                    checkest.level = standard.level;
                }
            } else {
                throw new Error("'checkers[].level' unkonwn.");
            }
        } else {
            throw new Error("'checkers[].level' incorrect type.");
        }

        checkest.linters = {};
        if (!("linters" in checker)) {
            throw new Error("'checkers[].linters' is undefined.");
        } else if (null === checker.linters) {
            throw new Error("'checkers[].linters' is null.");
        // "linters": "foolint"
        } else if ("string" === typeof checker.linters) {
            checkest.linters[checker.linters] = JSON.parse(fs.readFileSync(
                    path.join(dir, checker.linters + ".json"), "utf-8"));
        // "linters": ["foolint", "barlint"]
        } else if (Array.isArray(checker.linters)) {
            for (const linter of checker.linters) {
                checkest.linters[linter] = JSON.parse(fs.readFileSync(
                        path.join(dir, linter + ".json"), "utf-8"));
            }
        // "linters": { "foolint": ..., "barlint": ... }
        } else if ("object" === typeof checker.linters) {
            for (const linter in checker.linters) {
                // "linters": { "foolint": "qux.json" }
                if ("string" === typeof checker.linters[linter]) {
                    checkest.linters[linter] = JSON.parse(fs.readFileSync(
                            path.join(dir, checker.linters[linter]),
                            "utf-8"));
                // "linters": { "foolint": [..., ...] }
                } else if (Array.isArray(checker.linters[linter])) {
                    checkest.linters[linter] = {};
                    for (const option of checker.linters[linter]) {
                        if (null === option) {
                            throw new Error("linter option is null.");
                        // "linters": { "foolint": ["qux.json", ...] }
                        } else if ("string" === typeof option) {
                            Object.assign(checkest.linters[linter],
                                          JSON.parse(fs.readFileSync(
                                             path.join(dir, option), "utf-8")));
                        // "linters": { "foolint": [{ "qux": ..., ... }, ...]
                        } else if ("object" === typeof option) {
                            Object.assign(checkest.linters[linter], option);
                        } else {
                            throw new Error("linter option incorrect type");
                        }
                    }
                // "linters": { "foolint": { "qux": ..., "corge": ... } }
                // "linters": { "foolint": null }
                } else if ("object" === typeof checker.linters[linter]) {
                    checkest.linters[linter] = checker.linters[linter];
                } else {
                    throw new Error("linter incorrect type");
                }
            }
        } else {
            throw new Error("'checkers[].linters' incorrect type.");
        }

        return checkest;
    });
    return standard;
}; // normalize()

/**
 * Vérifier (en appelant des linters) une liste de fichiers.
 *
 * @param {Array.<string>} files    La liste des fichiers.
 * @param {Array.<Object>} checkers La liste des vérifications faites sur les
 *                                  fichiers.
 * @param {string}         root     L'adresse du répertoire où se trouve le
 *                                  dossier <code>.metalint/</code>.
 * @return {Object} Les listes des notifications (regroupées par fichier)
 *                  retournées par les linters.
 */
const check = function (files, checkers, root) {
    const results = {};
    for (const file of files) {
        const linters = [];
        for (const checker of checkers) {
            if (glob.match(file, checker.patterns, checker.hidden, root)) {
                linters.push({
                    "linters": checker.linters,
                    "level":   checker.level
                });
            }
        }
        if (0 !== linters.length) {
            results[file] = metalint(fs.readFileSync(file, "utf-8"), linters);
        } else {
            results[file] = Promise.resolve(null);
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

    for (const linter of ["csslint", "eslint", "html5-lint", "htmlhint",
                          "htmllint", "jscs", "jshint", "json-lint", "jsonlint",
                          "markdownlint"]) {
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
});
