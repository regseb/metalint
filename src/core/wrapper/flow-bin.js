/**
 * @module
 * @see {@link https://www.npmjs.com/package/flow-bin|Flow}
 */

import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import flow from "flow-bin";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Exécute une commande.
 *
 * @param {string}   command La commande qui sera exécutée.
 * @param {string[]} args    Les arguments passés à l'exécutable.
 * @param {string}   stdin   Les données d'entrée.
 * @returns {Promise<string>} Les retours de la commande.
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
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const source = await fs.readFile(file, "utf8");
    const raw = await exec(flow, ["check-contents", "--json", file], source);
    return JSON.parse(raw).errors
               .map(({ message }) => {
        const messages = [];
        const locations = [];
        for (const { descr, loc } of message) {
            messages.push(descr);
            if (undefined !== loc) {
                locations.push({
                    line:      loc.start.line,
                    column:    loc.start.column,
                    lineEnd:   loc.end.line,
                    columnEnd: loc.end.column,
                });
            }
        }

        return {
            file,
            linter:  "flow-bin",
            message: messages.join(" "),
            locations,
        };
    });
};
