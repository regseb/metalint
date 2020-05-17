/**
 * @module
 * @see {@link https://www.npmjs.com/package/flow-bin|Flow}
 */

"use strict";

const fs       = require("fs").promises;
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
        patterns: "*.js",
        linters:  { "flow-bin": null },
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
    return new Promise((resolve, reject) => {
        const child = spawn(command, args);
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });
        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });
        child.on("close", (code) => {
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
const wrapper = async function (file, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const source = await fs.readFile(file, "utf-8");
    const raw = await exec(flow, ["check-contents", "--json", file], source);
    return JSON.parse(raw).errors
               .map(({ message }) => {
        const messages = [];
        const locations = [];
        for (const { descr, loc } of message) {
            messages.push(descr);
            if (undefined === loc) {
                continue;
            }
            locations.push({
                line:      loc.start.line,
                column:    loc.start.column,
                lineEnd:   loc.end.line,
                columnEnd: loc.end.column,
            });
        }

        return {
            file,
            linter:  "flow-bin",
            message: messages.join(" "),
            locations,
        };
    });
};

module.exports = { configure, wrapper };
