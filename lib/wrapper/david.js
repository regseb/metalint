/**
 * @module
 * @see {@link https://www.npmjs.com/package/david|David DM}
 */

"use strict";

const fs       = require("fs").promises;
const david    = require("david");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour David DM.
 *
 * @returns {object} Le patron et les options par défaut.
 */
const configure = function () {
    return {
        patterns: "/package.json",
        linters:  { david: {} },
    };
};

/**
 * Liste les dépendances obsolètes par type.
 *
 * @param {string}  file   Le fichier <em>package.json</em> qui sera vérifié.
 * @param {object}  source L'objet JSON d'un fichier <em>package.json</em>.
 * @param {string}  type   Le type des dépendances (<code>null</code>,
 *                         <code>"dev"</code>, <code>"optional"</code> ou
 *                         <code>"peer"</code>).
 * @param {boolean} stable <code>true</code> pour remonter seulement les
 *                         nouvelles versions stables ; sinon
 *                         <code>false</code>.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const list = async function (file, source, type, stable) {
    const opts = {};
    if (null !== type) {
        opts[type] = true;
    }

    const deps = await new Promise((resolve) => {
        david.getDependencies(source, opts, (_, d) => resolve(d));
    });
    return Object.keys(deps).map((depName) => {
        const dep = deps[depName];
        if ("warn" in dep) {
            return {
                file:     file,
                linter:   "david",
                severity: SEVERITY.FATAL,
                message:  dep.warn.message,
            };
        }
        let severity = null;
        let message;
        if (david.isUpdated(dep, { stable: true })) {
            severity = SEVERITY.ERROR;
            message =
                "New stable version " + dep.stable + " is released to " +
                (null === type ? "d" : type + "D") + "ependencies '" + depName +
                "'.";
        } else if (!stable && david.isUpdated(dep)) {
            severity = SEVERITY.INFO;
            message =
                "New version " + dep.latest + " is released to " +
                (null === type ? "d" : type + "D") + "ependencies '" + depName +
                "'.";
        }

        return {
            file:     file,
            linter:   "david",
            severity: severity,
            message:  message,
        };
    }).filter((n) => null !== n.severity);
};

/**
 * Analyse toutes les dépendances d'un <em>package.json</em> (d'un module
 * <em>npm</em>) avec <strong>David DM</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @param {object} options Les options qui seront passées à l'outil.
 * @returns {Promise.<Array.<object>>} Une promesse retournant la liste des
 *                                     notifications.
 */
const wrapper = async function (file, level, options) {
    if (SEVERITY.FATAL > level) {
        return [];
    }

    const source = JSON.parse(await fs.readFile(file, "utf-8"));
    const results = [];
    results.push(list(file, source, null, options.stable));
    if ("dev" in options && options.dev) {
        results.push(list(file, source, "dev", options.stable));
    }
    if ("optional" in options && options.optional) {
        results.push(list(file, source, "optional", options.stable));
    }
    if ("peer" in options && options.peer) {
        results.push(list(file, source, "peer", options.stable));
    }
    const notices = await Promise.all(results);
    return [].concat(...notices);
};

module.exports = { configure, wrapper };
