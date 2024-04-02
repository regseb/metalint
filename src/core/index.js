/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import flatten from "./configuration/flatten.js";
import normalize from "./configuration/normalize.js";
import { mergeLinters } from "./configuration/override.js";
import Results from "./results.js";
import { exists } from "./utils/file.js";
import Glob from "./utils/glob.js";

/**
 * @typedef {import("../types/configuration/flattened.d.ts").FlattenedConfig} FlattenedConfig
 * @typedef {import("../types/configuration/flattened.d.ts").FlattenedConfigChecker} FlattenedConfigChecker
 * @typedef {import("../types/level.d.ts").default} Level
 * @typedef {import("../types/notice.d.ts").default} Notice
 * @typedef {import("../types/severity.d.ts").default} Severity
 * @typedef {import("../types/typeofformatter.d.ts").default} TypeofFormatter
 * @typedef {import("./formatter/formatter.js").default} Formatter
 * @typedef {import("./wrapper/wrapper.js").default} Wrapper
 */

export default class Metalint {
    /**
     * Le répertoire racine.
     *
     * @type {string}
     */
    #root;

    /**
     * Les motifs généraux des fichiers.
     *
     * @type {Glob}
     */
    #glob;

    /**
     * Les checkers (avec leurs linters).
     */
    #checkers;

    /**
     * Les formatters.
     *
     * @type {Formatter[]}
     */
    #formatters;

    /**
     * Le cache des wrappers.
     *
     * @type {Map<string, Wrapper[]>}
     */
    #cache = new Map();

    /**
     * Crée une instance de Metalint à partir d'une configuration sur le système
     * de fichiers.
     *
     * @param {Object}          [options]           Les éventuelles options pour
     *                                              créer une instance de
     *                                              Metalint.
     * @param {string}          [options.config]    L'éventuel chemin vers le
     *                                              fichier de configuration de
     *                                              Metalint.
     * @param {boolean}         [options.fix]       L'éventuelle marque
     *                                              indiquant si les linters
     *                                              doivent corriger les
     *                                              fichiers.
     * @param {TypeofFormatter} [options.formatter] L'éventuel formatteur à
     *                                              utiliser.
     * @param {Level}           [options.level]     L'éventuel niveau minimum
     *                                              des notifications à
     *                                              rapporter.
     * @returns {Promise<Metalint>} Une promesse contenant l'instance de
     *                              Metalint.
     */
    static async fromFileSystem(options = {}) {
        const config = options.config ?? ".metalint/metalint.config.js";

        // Rechercher le fichier de configuration dans le répertoire courant,
        // puis dans les parents, grands-parents...
        let root = process.cwd();
        while (!(await exists(path.join(root, config)))) {
            // Si on est remonté à la racine.
            if (path.join(root, "..") === root) {
                throw new Error("No such config file.");
            }
            root = path.join(root, "..");
        }

        // eslint-disable-next-line no-unsanitized/method
        const { default: configuration } = await import(
            pathToFileURL(path.join(root, config)).href
        );
        const { patterns, reporters, checkers } = flatten(
            await normalize(configuration, {
                dir: path.dirname(path.join(root, config)),
            }),
            {
                fix: options.fix,
                formatter: options.formatter,
                level: options.level,
            },
        );
        return new Metalint({ patterns, reporters, checkers }, { root });
    }

    /**
     * Crée une instance de Metalint.
     *
     * @param {FlattenedConfig} config       La configuration de Metalint.
     * @param {Object}          context      Le contexte.
     * @param {string}          context.root Le répertoire racine.
     */
    constructor(config, { root }) {
        this.#root = root;
        this.#glob = new Glob(config.patterns, { root: this.#root });

        this.#formatters = config.reporters.map((reporter) => {
            // eslint-disable-next-line new-cap
            return new reporter.formatter(reporter.level, reporter.options);
        });

        this.#checkers = config.checkers.map((checker) => ({
            glob: new Glob(checker.patterns, { root: this.#root }),
            linters: checker.linters,
            overrides: checker.overrides.map((override) => ({
                glob: new Glob(override.patterns, { root: this.#root }),
                linters: override.linters,
            })),
        }));
    }

    /**
     * Vérifie (en appelant des linters) des répertoires et des fichiers.
     *
     * @param {string[]} bases Les répertoires et les fichiers.
     * @returns {Promise<Record<string, Notice[]|undefined>>} Une promesse
     *                                                        retournant la
     *                                                        liste des
     *                                                        notifications
     *                                                        regroupées par
     *                                                        fichier.
     */
    async lintFiles(bases) {
        const files = /** @type {string[]} */ ([]);
        for (const base of bases) {
            files.push(...(await this.#glob.walk(base)));
        }
        const results = new Results(files);
        for (const file of files) {
            for (const [i, checker] of Object.entries(this.#checkers)) {
                if (checker.glob.test(file)) {
                    let key = i.toString();
                    const values = [checker.linters];
                    for (const [j, override] of Object.entries(
                        checker.overrides,
                    )) {
                        if (override.glob.test(file)) {
                            key += `.${j}`;
                            values.push(override.linters);
                        }
                    }

                    let wrappers;
                    if (this.#cache.has(key)) {
                        wrappers = this.#cache.get(key);
                    } else {
                        wrappers = values.reduce(mergeLinters).map((linter) => {
                            // eslint-disable-next-line new-cap
                            return new linter.wrapper(
                                {
                                    fix: linter.fix,
                                    level: linter.level,
                                    root: this.#root,
                                    files,
                                },
                                linter.options,
                            );
                        });
                        this.#cache.set(key, wrappers);
                    }
                    for (const wrapper of wrappers) {
                        results.add(file, await wrapper.lint(file));
                    }
                }
            }
        }

        return results.toObject();
    }

    /**
     * Rapporte des résultats dans les formats choisis.
     *
     * @param {Record<string, Notice[]|undefined>} results La liste des
     *                                                     notifications
     *                                                     regroupées par
     *                                                     fichier.
     * @returns {Promise<Severity|undefined>} La sévérité la plus élevée des
     *                                        notifications ; ou
     *                                        <code>undefined</code> si les
     *                                        résultats ont aucune notification.
     */
    async report(results) {
        let severity;

        for (const [file, notices] of Object.entries(results)) {
            // Déterminer la sévérité la plus élevée des résultats.
            if (undefined !== notices) {
                for (const notice of notices) {
                    if (undefined === severity || severity > notice.severity) {
                        severity = notice.severity;
                    }
                }
            }

            // Afficher les notifications avec chaque rapporteur.
            for (const formatter of this.#formatters) {
                await formatter.notify(file, notices);
            }
        }

        // Attendre tous les rapporteurs.
        await Promise.all(this.#formatters.map((f) => f.finalize()));
        return severity;
    }
}
