/**
 * @module wrapper/flow-bin
 * @see {@link https://www.npmjs.com/package/flow-bin|Flow}
 */

"use strict";

const fs       = require("fs");
const spawn    = require("child_process").spawn;
const flow     = require("flow-bin");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour Flow.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    return {
        "patterns": "*.js",
        "linters":  { "flow-bin": null }
    };
};

/**
 * Exécute une commande.
 *
 * @param {string}         command La commande qui sera exécutée.
 * @param {Array.<string>} args    Les arguments passés à l'exécutable.
 * @param {string}         stdin   Les données d'entrée.
 * @returns {Promise.<string>} Les retours de la commande.
 */
const exec = function (command, args, stdin) {
    return new Promise(function (resolve, reject) {
        const child = spawn(command, args);
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", function (data) {
            stdout += data.toString();
        });
        child.stderr.on("data", function (data) {
            stderr += data.toString();
        });
        child.on("close", function (code) {
            if (0 === code) {
                resolve(stdout);
            } else {
                reject(stderr);
            }
        });
        child.stdin.write(stdin);
        child.stdin.end();
    });
};

/**
 * Vérifie un fichier avec le linter <strong>Flow</strong>.
 *
 * @param {string} file  Le fichier qui sera vérifié.
 * @param {number} level Le niveau de sévérité minimum des notifications
 *                       retournées.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = function (file, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    return new Promise(function (resolve) {
        fs.readFile(file, "utf-8", (_, source) => resolve(source));
    }).then(function (source) {
        return exec(flow, ["check-contents", "--json", file], source);
    }).then(function (raw) {
        return JSON.parse(raw).errors.map(function ({ message }) {
            const locations = [];
            const messages = [];
            for (const { descr, loc } of message) {
                messages.push(descr);
                if (undefined === loc) {
                    continue;
                }
                const { start, end } = loc;
                for (let column = start.column; column <= end.column;
                                                                     ++column) {
                    locations.push({
                        "line":   start.line,
                        "column": column
                    });
                }
            }
            return {
                "file":      file,
                "linter":    "flow-bin",
                "message":   messages.join(" "),
                "locations": locations
            };
        });
    });
};

module.exports = { configure, wrapper };
