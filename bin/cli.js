#!/usr/bin/env node

"use strict";

const fs        = require("fs");
const path      = require("path");
const yargs     = require("yargs");
const glob      = require("./glob");
const metalint  = require("../lib/index");
const reporters = require("../lib/reporters");
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
        throw new Error("patterns incorrect type.");
    }

    if (!("hidden" in rotten)) {
        standard.hidden = false;
    } else if ("boolean" === typeof rotten.hidden) {
        standard.hidden = rotten.hidden;
    } else {
        throw new Error("hidden incorrect type.");
    }

    if (!("level" in rotten)) {
        standard.level = SEVERITY.INFO;
    } else if ("string" === typeof rotten.level) {
        if (rotten.level in SEVERITY) {
            standard.level = SEVERITY[rotten.level];
        } else {
            throw new Error("level unkonwn.");
        }
    } else {
        throw new Error("level incorrect type.");
    }

    if (!("reporter" in rotten)) {
        standard.reporter = reporters.console;
    } else if ("string" === typeof rotten.reporter) {
        if (rotten.reporter in reporters) {
            standard.reporter = reporters[rotten.reporter];
        } else {
            throw new Error("reporter unkonwn.");
        }
    } else {
        throw new Error("reporter incorrect type.");
    }

    if (!("verbose" in rotten)) {
        standard.verbose = 0;
    } else if ("number" === typeof rotten.verbose) {
        standard.verbose = rotten.verbose;
    } else {
        throw new Error("reporter incorrect type.");
    }

    if (!("output" in rotten) || null === rotten.output) {
        standard.output = process.stdout;
    } else if ("string" === typeof rotten.output) {
        try {
            standard.output = fs.createWriteStream(rotten.output,
                                                   { "flags": "w" });
        } catch (exc) {
            throw new Error("output don't writable.");
        }
    } else {
        throw new Error("output incorrect type.");
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
            throw new Error("cherkers[].patterns incorrect type.");
        }

        if (!("hidden" in checker)) {
            checkest.hidden = standard.hidden;
        } else if ("boolean" === typeof rotten.hidden) {
            standard.hidden = rotten.hidden;
        } else {
            throw new Error("checkers[].hidden incorrect type.");
        }

        if (!("level" in checker)) {
            checkest.level = standard.level;
        } else if ("string" === typeof checker.level) {
            if (checker.level in SEVERITY) {
                checkest.level = SEVERITY[checker.level];
            } else {
                throw new Error("checkers[].level unkonwn.");
            }
        } else {
            throw new Error("checkers[].level incorrect type.");
        }

        checkest.linters = {};
        if (!("linters" in checker)) {
            throw new Error("checkers[].linters is undefined.");
        } else if (null === checker.linters) {
            throw new Error("checkers[].linters is null.");
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
                // "linters": { "foolint": { "qux": ..., "corge": ... } }
                // "linters": { "foolint": null }
                } else if ("object" === typeof checker.linters[linter]) {
                    checkest.linters[linter] = checker.linters[linter];
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
                } else {
                    throw new Error("linter incorrect type");
                }
            }
        } else {
            throw new Error("checkers[].linters incorrect type.");
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
 * @return {Object} Les listes des notifications (regroupées par fichier)
 *                  retournées par les linters.
 */
const check = function (files, checkers, root) {
    const promises = [];
    for (const file of files) {
        let linters = [];
        for (const checker of checkers) {
            if (glob.match(file, checker.patterns, checker.hidden, root)) {
                linters.push({
                    "linters": checker.linters,
                    "level":   checker.level
                });
            }
        }
        let promise;
        if (0 !== linters.length) {
            promise = metalint(fs.readFileSync(file, "utf-8"), linters);
        } else {
            promise = Promise.resolve(null);
        }
        promises.push(promise.then(function (notices) {
            return { file, notices };
        }));
    }

    return Promise.all(promises).then(function (raws) {
        const obj = {};
        for (const raw of raws) {
            obj[raw.file] = raw.notices;
        }
        return obj;
    });
}; // check()

if (argv.help) {
    process.stdout.write(
        "Usage: metalint [OPTION...] [FILE...]\n" +
        "Check FILEs.\n" +
        "\n"
    );
    process.exit(0);
}
if (argv.version) {
    const pack = JSON.parse(fs.readFileSync(path.join(__dirname,
                                                      "/../package.json"),
                                            "utf-8"));
    process.stdout.write(pack.name + " " + pack.version + "\n");
    // TODO Afficher aussi la version des linters.
    process.exit(0);
}

let root = process.cwd();
// Rechercher le fichier de configuration dans le répertoire courant, puis les
// parents.
while (!fs.existsSync(path.join(root, argv.config))) {
    // Si on est remonté à la racine.
    if (path.join(root, "..") === root) {
        process.stderr.write("config unknown\n");
        process.exit(1);
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
config = normalize(config, path.dirname(path.join(root, argv.config)));

let files = [];
if (0 === argv._.length) {
    files = files.concat(glob.walk(null, config.patterns, config.hidden, root));
} else {
    for (const file of argv._) {
        files = files.concat(glob.walk(file, config.patterns, config.hidden,
                                       root));
    }
}
// Supprimer les doublons.
files = files.filter(function (value, index, self) {
    return self.indexOf(value) === index;
});
const results = check(files, config.checkers, root);

// Afficher les résultats.
config.reporter(results, config.output,
                         config.verbose).then(function (severity) {
    // Attendre que tous les textes soient écrits avant de retourner le status.
    config.output.write("", function () {
        process.exit(null === severity || SEVERITY.ERROR < severity ? 0 : 1);
    });
});
