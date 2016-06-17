"use strict";

const spawn    = require("child_process").spawn;
const flow     = require("flow-bin");
const SEVERITY = require("../severity");

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
                reject(stderr)
            }
        });
        child.stdin.write(stdin);
        child.stdin.end();
    });
}; // exec()

/**
 * Vérifier du code source avec le linter <strong>Flow</strong>.
 *
 * @param {string} source  Le code source qui sera vérifié.
 * @param {Object} options Les options qui seront passées au linter.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (source, options, level) {
    if (SEVERITY.ERROR > level) {
        return Promise.resolve([]);
    }

    const args = ["check-contents", "--json"];
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
}; // wrapper()

module.exports = wrapper;