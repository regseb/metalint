#!/usr/bin/env node

"use strict";

let fs        = require("fs");
let path      = require("path");
let yargs     = require("yargs");
let globby    = require("globby");
let minimatch = require("minimatch");
let metalint  = require("../lib/index");
let reporters = require("../lib/reporters");
let SEVERITY  = require("../lib/severity");

let argv = yargs
        .usage("Usage: $0 [options] [files...]")
        .options({
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
        })
        .argv;

/**
 * Fusionner deux objets JSON. Si une propriété est présente dans les deux
 * objets : c'est valeur du second objet qui sera copié dans le nouvel objet.
 *
 * @param {Object} first  Le premier objet JSON.
 * @param {Object} second Le second objet JSON.
 * @return {Object} Le nouvel objet JSON contenant les propriétés des deux
 *                  objets.
 */
let merge = function (first, second) {
    let third = {};
    for (let key in first) {
        third[key] = first[key];
    }
    for (let key in second) {
        third[key] = second[key];
    }
    return third;
}; // merge()

/**
 * Normaliser la configuration. La structure de l'objet JSON contenant la
 * configuration est souple pour rendre le fichier moins verbeuse. Cette
 * fonction renseigne les valeurs par défaut pour les propriétes non-présentes.
 *
 * @param {Object} rotten L'objet JSON contenant la configuration.
 * @param {string} dir    Le repertoire où se trouve le fichier de
                          configuration.
 * @return {Object} L'objet JSON normalisé.
 */
let normalize = function (rotten, dir) {
    let standard = {};
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
        let checkest = {};
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
            for (let linter of checker.linters) {
                checkest.linters[linter] = JSON.parse(fs.readFileSync(
                        path.join(dir, linter + ".json"), "utf-8"));
            }
        // "linters": { "foolint": ..., "barlint": ... }
        } else if ("object" === typeof checker.linters) {
            for (let linter in checker.linters) {
                // "linters": { "foolint": "qux.json" }
                if ("string" === typeof checker.linters[linter]) {
                    checkest.linters[linter] = JSON.parse(fs.readFileSync(
                            path.join(dir, checker.linters[linter] + ".json"),
                            "utf-8"));
                // "linters": { "foolint": { "qux": ..., "corge": ... } }
                // "linters": { "foolint": null }
                } else if ("object" === typeof checker.linters[linter]) {
                    checkest.linters[linter] = checker.linters[linter];
                // "linters": { "foolint": [..., ...] }
                } else if (Array.isArray(checker.linters[linter])) {
                    checkest.linters[linter] = {};
                    for (let option of checker.linters[linter]) {
                        if (null === option) {
                            throw new Error("linter option is null.");
                        // "linters": { "foolint": ["qux.json", ...] }
                        } else if ("string" === typeof option) {
                            checkest.linters[linter] = merge(
                                checkest.linters[linter],
                                JSON.parse(fs.readFileSync(
                                    path.join(dir, option), "utf-8")));
                        // "linters": { "foolint": [{ "qux": ..., ... }, ...]
                        } else if ("object" === typeof option) {
                            checkest.linters[linter] = merge(
                                checkest.linters[linter], option);
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
 * Filtrer une liste de fichier en fonction de patrons.
 *
 * @param {Array.<string>} files    La liste des fichiers.
 * @param {Array.<string>} patterns La liste des patrons.
 * @param {boolean}        hidden   L'indicateur pour savoir s'il faut chercher
                                    dans les fichiers cachés.
 * @return {Array.<string>} La liste des fichiers respectant un des patrons.
 */
let filter = function (files, patterns, hidden) {
    return files.filter(function (file) {
        let match = false;
        for (let pattern of patterns) {
            if ("!" !== pattern[0]) {
                if (minimatch(file, pattern, { "dot": hidden })) {
                    match = true;
                }
            } else if (!minimatch(file, pattern, { "dot": hidden })) {
                return false;
            }
        }
        return match;
    });
}; // filter()

/**
 * Trier les propriétés (en fonction de la clé) d'un objet JSON.
 *
 * @param {Object} mess L'objet JSON avec des propriétés dans le désordre.
 * @return {Object} L'objet JSON avec les propriétés triées.
 */
let sort = function (mess) {
    let order = {};
    for (let key of Object.keys(mess).sort()) {
        order[key] = mess[key];
    }
    return order;
}; // order()

/**
 * Vérifier (en appelant des linters) une liste de fichiers.
 *
 * @param {Array.<string>} files    La liste des fichiers.
 * @param {Array.<Object>} checkers La liste des vérifications faites sur les
 *                                  fichiers.
 * @return {Object} Les listes des notifications (regroupées par fichier)
 *                  retournées par les linters.
 */
let check = function (files, checkers) {
    let results = {};
    for (let checker of checkers) {
        let subfiles = filter(files, checker.patterns, checker.hidden);
        for (let subfile of subfiles) {
            if (!(subfile in results)) {
                results[subfile] = [];
            }
            let content =  fs.readFileSync(subfile, "utf-8");
            results[subfile] = results[subfile].concat(
                            metalint(content, checker.linters, checker.level));
        }
    }

    // Ajouter les fichiers qui n'ont pas été vérifiés dans les résultats.
    for (let file of files) {
        if (!(file in results)) {
            results[file] = null;
        }
    }

    return sort(results);
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
    let pack = JSON.parse(fs.readFileSync(__dirname + "/../package.json",
                                          "utf-8"));
    process.stdout.write(pack.name + " " + pack.version + "\n");
    // TODO Afficher aussi la version des linters.
    process.exit(0);
}

let cwd = process.cwd();
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
let ancestors = "";
if (root !== cwd) {
    ancestors = process.cwd().replace(root + "/", "");
    process.chdir(root);
}

let config = JSON.parse(fs.readFileSync(argv.config, "utf-8"));
// Surcharger les données du fichier de configuration par les paramètres de la
// ligne de commande.
for (let key of ["hidden", "level", "output", "patterns", "reporter",
                 "verbose"]) {
    if (undefined !== argv[key]) {
        config[key] = argv[key];
    }
}
config = normalize(config, path.dirname(argv.config));

let files = globby.sync(config.patterns, { "dot": config.hidden });
files = files.filter(function (file) {
    return !fs.lstatSync(file).isDirectory();
});

let results = {};
if (0 === argv._.length) {
    let subfiles = filter(files, [path.join(ancestors, "**")], config.hidden);
    let subresults = check(subfiles, config.checkers);
    if ("" === ancestors) {
        results = subresults;
    } else {
        for (let file in subresults) {
            results[file.replace(ancestors + "/", "")] = subresults[file];
        }
    }
} else {
    for (let file of argv._) {
        let subfiles = filter(files, [path.join(ancestors, file)],
                              config.hidden);
        let subresults = check(subfiles, config.checkers);
        for (let subfile in subresults) {
            results[file] = subresults[subfile];
        }
    }
}

process.chdir(cwd);

let severity = config.reporter(results, config.output, config.verbose);
config.output.write("", function () {
    process.exit(null === severity || SEVERITY.ERROR < severity ? 0 : 1);
});
