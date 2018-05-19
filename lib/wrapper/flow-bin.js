"use strict";

const fs       = require("fs");
const spawn    = require("child_process").spawn;
const flow     = require("flow-bin");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour Flow.
 *
 * @return {Object} Les patrons et les options par défaut.
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
 * @return {Promise.<string>} Les retours de la commande.
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
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (file, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    const args = ["check-contents", "--json", file];
    const source = fs.readFileSync(file, "utf-8");
    return exec(flow, args, source).then(function (raw) {
        const notices = [];
        for (const { message } of JSON.parse(raw).errors) {
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
            notices.push({
                "linter":    "flow-bin",
                "rule":      null,
                "severity":  SEVERITY.ERROR,
                "message":   messages.join(" "),
                "locations": locations
            });
        }
        return notices;
    });
};

module.exports = { configure, wrapper };
