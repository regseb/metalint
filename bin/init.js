#!/usr/bin/env node

"use strict";

const fs    = require("fs");
const path  = require("path");
const log   = require("npmlog");
const yargs = require("yargs");

const argv = yargs.options({
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
    }
}).help(false).version(false).parse();

if (!fs.existsSync("package.json")) {
    log.error("metalint", "package.json non-trouvé.");
    process.exit(1);
}

if (fs.existsSync(".metalint/metalint.json")) {
    log.warn("metalint", "Configuration déjà présente.");
    process.exit(0);
}

// Créer le répertoire de la configuration.
fs.mkdirSync(".metalint");

// Initialiser les données de la configuration.
const config = {
    "patterns": ["!.git/", "!node_modules/", "**"],
    "checkers": []
};
// Surcharger la configuration par les paramètres de la ligne de commande.
for (const key of ["level", "output", "patterns", "reporter", "verbose"]) {
    if (undefined !== argv[key]) {
        config[key] = argv[key];
    }
}

// Ajouter la configuration des linters.
const linters = fs.readdirSync(path.join(__dirname, "../lib/wrapper/"))
                  .map((linter) => linter.slice(0, -3));
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
for (const dependency in pkg.devDependencies) {
    if (linters.includes(dependency)) {
        const { configure } = require("../lib/wrapper/" + dependency);
        const checker = configure();
        if ("object" === checker.linters[dependency]) {
            fs.writeFileSync(".metalint/" + dependency + ".json",
                             JSON.stringify(checker.linters[dependency],
                                            null, 4) + "\n");
            checker.linters = dependency;
        }
        config.checkers.push(checker);
    }
}

fs.writeFileSync(".metalint/metalint.json",
                 JSON.stringify(config, null, 4) + "\n");
log.info("metalint", "Successfully created .metalint/metalint.json file");
