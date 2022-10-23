/**
 * @module
 * @see {@link https://www.npmjs.com/package/addons-linter|Add-ons Linter}
 */

import path from "node:path";
import linter from "addons-linter";
import SEVERITY from "../severity.js";

/**
 * @typedef {import("../../types").Notice} Notice
 */

/**
 * Vérifie un fichier avec <strong>Add-ons Linter</strong>.
 *
 * @param {string}           file    Le fichier qui sera vérifié.
 * @param {number}           level   Le niveau de sévérité minimum des
 *                                   notifications retournées.
 * @param {Object|undefined} options Les options qui seront passées au linter ou
 *                                   <code>undefined</code> pour les options par
 *                                   défaut.
 * @returns {Promise<Notice[]>} Une promesse retournant la liste des
 *                              notifications.
 */
export const wrapper = async function (file, level, options) {
    if (SEVERITY.ERROR > level) {
        return [];
    }

    const config = {
        _:                [file],
        logLevel:         "error",
        stack:            false,
        pretty:           false,
        warningsAsErrors: false,
        metadata:         false,
        output:           "none",
        boring:           false,
        selfHosted:       false,
        shouldScanFile:   () => true,
        ...options,
    };
    const results = await linter.createInstance({ config }).run();
    return [...results.errors,
            ...results.warnings,
            ...results.notices].map((result) => {
        let severity;
        switch (result["_type"]) {
            case "error":   severity = SEVERITY.ERROR; break;
            case "warning": severity = SEVERITY.WARN;  break;
            default:        severity = SEVERITY.INFO;
        }

        return {
            file:      null === result.file || undefined === result.file
                                                 ? file
                                                 : path.join(file, result.file),
            linter:    "addons-linter",
            rule:      result.code,
            severity,
            message:   result.message,
            locations: [],
        };
    }).filter((n) => level >= n.severity);
};
