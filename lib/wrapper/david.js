"use strict";

const fs       = require("fs");
const david    = require("david");
const SEVERITY = require("../severity");

/**
 * Initialise un checker pour David DM.
 *
 * @return {Object} Les patrons et les options par défaut.
 */
const configure = function () {
    return {
        "patterns": "package.json",
        "linters":  { "david": {} }
    };
};

/**
 * Liste les dépendances obsolètes par type.
 *
 * @param {Object}  source L'objet JSON d'un fichier <em>package.json</em>.
 * @param {string}  type   Le type des dépendances (<code>null</code>,
 *                         <code>"dev"</code>, <code>"optional"</code> ou
 *                         <code>"peer"</code>).
 * @param {boolean} stable <code>true</code> pour remonter seulement les
 *                         nouvelles versions stables ; sinon
 *                         <code>false</code>.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const list = function (source, type, stable) {
    return new Promise(function (resolve) {
        const opts = {};
        if (null !== type) {
            opts[type] = true;
        }
        david.getDependencies(source, opts, function (_, deps) {
            resolve(Object.keys(deps).map(function (depName) {
                const dep = deps[depName];
                if ("warn" in dep) {
                    return {
                        "linter":    "david",
                        "rule":      null,
                        "severity":  SEVERITY.FATAL,
                        "message":   dep.warn.message,
                        "locations": []
                    };
                }
                let severity = null;
                let message;
                if (david.isUpdated(dep, { "stable": true })) {
                    severity = SEVERITY.ERROR;
                    message =
                        "New stable version " + dep.stable + " is" +
                        " released to " +
                        (null === type ? "d" : type + "D") +
                        "ependencies '" + depName + "'.";
                } else if (!stable && david.isUpdated(dep)) {
                    severity = SEVERITY.INFO;
                    message =
                        "New version " + dep.latest + " is released to " +
                        (null === type ? "d" : type + "D") +
                        "ependencies '" + depName + "'.";
                }
                return {
                    "linter":    "david",
                    "rule":      null,
                    "severity":  severity,
                    "message":   message,
                    "locations": []
                };
            }).filter((notice) => null !== notice.severity));
        });
    });
};

/**
 * Analyse toutes les dépendances d'un <em>package.json</em> (d'un module
 * <em>npm</em>) avec <strong>David DM</strong>.
 *
 * @param {string} file    Le fichier qui sera vérifié.
 * @param {Object} options Les options qui seront passées à l'outil.
 * @param {number} level   Le niveau de sévérité minimum des notifications
 *                         retournées.
 * @return {Promise.<Array.<Object>>} Une promesse retournant la liste des
 *                                    notifications.
 */
const wrapper = function (file, options, level) {
    if (SEVERITY.FATAL > level) {
        return Promise.resolve([]);
    }

    const source = JSON.parse(fs.readFileSync(file, "utf-8"));
    const results = [];
    results.push(list(source, null, options.stable));
    if ("dev" in options && options.dev) {
        results.push(list(source, "dev", options.stable));
    }
    if ("optional" in options && options.optional) {
        results.push(list(source, "optional", options.stable));
    }
    if ("peer" in options && options.peer) {
        results.push(list(source, "peer", options.stable));
    }
    return Promise.all(results).then(function (notices) {
        return [].concat(...notices);
    });
};

module.exports = { configure, wrapper };
