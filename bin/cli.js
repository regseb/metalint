#!/usr/bin/env node

var fs        = require("fs");
var path      = require("path");
var yargs     = require("yargs");
var globby    = require("globby");
var minimatch = require("minimatch");
var metalint  = require("../lib/index");
var reporters = require("../lib/reporters");
var SEVERITY  = require("../lib/severity");

var argv = yargs
        .usage("Usage: $0 [options] [files...]")
        .option("level", {
            "demand": false,
            "describe": "Set the level of severity",
            "type": "string"
        })
        .requiresArg("level")
        .option("options", {
            "demand": false,
            "default": ".metalint/metalint.json",
            "describe": "Set the location at options",
            "type": "string"
        })
        .requiresArg("options")
        .option("reporter", {
            "demand": false,
            "default": "console",
            "describe": "Use your reporter implmentation",
            "type": "string"
        })
        .requiresArg("reporter")
        .count("verbose")
        .alias("v", "verbose")
        .help("help")
        .argv;

/**
 * Normaliser les options. La structure de l'objet JSON contenant les options
 * est souple pour rendre la configuration moins verbeuse. Cette fonction
 * renseigne les valeurs par défaut pour les propriétes non-présentes.
 *
 * @param options L'objet JSON conenant les options.
 * @return L'objet JSON normalisé.
 */
var normalize = function (rotten, dir) {
    var standard = {};
    if (!("patterns" in rotten)) {
        standard.patterns = ["**"];
    } else if (!Array.isArray(rotten.patterns)) {
        standard.patterns = [rotten.patterns];
    } else {
        standard.patterns = rotten.patterns;
    }

    if (!("hidden" in rotten)) {
        standard.hidden = false;
    } else {
        standard.hidden = rotten.hidden;
    }

    if (!("level" in rotten)) {
        standard.level = SEVERITY.INFO;
    } else if ("string" === typeof rotten.level) {
        standard.level = SEVERITY[rotten.level];
    } else {
        standard.level = rotten.level;
    }

    standard.checkers = rotten.checkers.map(function (checker) {
        var checkest = {};
        if (!("patterns" in checker)) {
            checkest.patterns = ["**"];
        } else if (!Array.isArray(checker.patterns)) {
            checkest.patterns = [checker.patterns];
        } else {
            checkest.patterns = checker.patterns;
        }

        if (!("hidden" in checker)) {
            checkest.hidden = standard.hidden;
        } else {
            checkest.hidden = checkest.hidden;
        }

        if (!("level" in checker)) {
            checkest.level = standard.level;
        } else if ("string" === typeof checker.level) {
            checkest.level = SEVERITY[checker.level];
        } else {
            checkest.level = checker.level;
        }

        checkest.linters = {};
        if ("string" === typeof checker.linters) {
            checkest.linters[checker.linters] = JSON.parse(fs.readFileSync(
                    path.join(dir, checker.linters + ".json"), "utf-8"));
        } else if (Array.isArray(checker.linters)) {
            checker.linters.forEach(function (linter) {
                checkest.linters[linter] = JSON.parse(fs.readFileSync(
                        path.join(dir, linter + ".json"), "utf-8"));
            });
        } else {
            checkest.linters = checker.linters;
        }

        return checkest;
    });
    return standard;
}; // normalize()

/**
 * Filtrer une liste de fichier en fonction de patrons.
 *
 * @param files    La liste des fichiers.
 * @param patterns La liste des patrons.
 * @return La liste des fichiers respectant un des patrons.
 */
var filter = function (files, patterns, hidden) {
    return files.filter(function (file) {
        var match = false;
        for (var i in patterns) {
            var pattern = patterns[i];
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
 * @param mess L'objet JSON avec des propriétés dans le désordre.
 * @return L'objet JSON avec les propriétés triées.
 */
var sort = function (mess) {
    var order = {};
    Object.keys(mess).sort().forEach(function (key) {
        order[key] = mess[key];
    });
    return order;
}; // order()

/**
 * Vérifier une liste de fichiers.
 *
 * @param files    La liste des fichiers.
 * @param checkers La liste des vérifications faites sur les fichiers.
 * @return Les listes des notifications (regroupées par fichier) retournées par
 *         les linters.
 */
var check = function (files, checkers) {
    var results = {};
    checkers.forEach(function (checker) {
        var subfiles = filter(files, checker.patterns, checker.hidden);
        subfiles.forEach(function (subfile) {
            if (!(subfile in results)) {
                results[subfile] = [];
            }
            var content =  fs.readFileSync(subfile, "utf-8");
            results[subfile] = results[subfile].concat(
                            metalint(content, checker.linters, checker.level));
        });
    });

    // Ajouter les fichiers qui n'ont pas été vérifiés dans les résultats.
    files.forEach(function (file) {
        if (!(file in results)) {
            results[file] = null;
        }
    });

    return sort(results);
}; // check()


var cwd = process.cwd();
var root = process.cwd();
// Rechercher le fichier d'options dans le répertoire courant, puis les parents.
while (!fs.existsSync(path.join(root, argv.options))) {
    // Si on est remonté à la racine.
    if (path.join(root, "..") === root) {
        console.err("options unknown");
        process.exit(1);
    }
    root = path.join(root, "..");
}
var ancestors = "";
if (root !== cwd) {
    ancestors = process.cwd().replace(root + "/", "");
    process.chdir(root);
}

var options = JSON.parse(fs.readFileSync(argv.options, "utf-8"));
// Si le niveau est spécifié dans la ligne de commande : utiliser celui-ci.
if (undefined !== argv.level) {
    options.level = SEVERITY[argv.level];
}
options = normalize(options, path.dirname(argv.options));

var files = globby.sync(options.patterns, { "dot": options.hidden });

var results = {};
if (0 === argv._.length) {
    var subfiles = filter(files, [path.join(ancestors, "**")], options.hidden);
    var subresults = check(subfiles, options.checkers);
    if ("" === ancestors) {
        results = subresults;
    } else {
        for (var file in subresults) {
            results[file.replace(ancestors + "/", "")] = subresults[file];
        }
    }
} else {
    argv._.forEach(function (file) {
        var subfiles = filter(files, [path.join(ancestors, file)],
                              options.hidden);
        var subresults = check(subfiles, options.checkers);
        for (var subfile in subresults) {
            results[file] = subresults[subfile];
        }
    });
}

process.chdir(cwd);

if (argv.reporter in reporters) {
    reporters[argv.reporter](results, process.stdout, argv.verbose);
} else {
    console.err("reporter unknown");
    process.exit(1);
}
process.exit(0);
