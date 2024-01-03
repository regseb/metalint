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
 * @typedef {import("../type/index.d.ts").FlattenedConfigChecker} FlattenedConfigChecker
 * @typedef {import("../type/index.d.ts").Notice} Notice
 */

export default class Metalint {
    #root;
    #glob;
    #checkers;
    #formatters;
    #cache = new Map();

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
            pathToFileURL(path.join(root, config))
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
        return new Metalint({ root, patterns, reporters, checkers });
    }

    constructor(config) {
        this.#root = config.root;
        this.#glob = new Glob(config.patterns, { root: config.root });

        this.#formatters = config.reporters.map((reporter) => {
            // eslint-disable-next-line new-cap
            return new reporter.formatter(reporter.level, reporter.options);
        });

        this.#checkers = config.checkers.map((checker) => ({
            ...checker,
            glob: new Glob(checker.patterns, { root: this.#root }),
            overrides: checker.overrides.map((override) => ({
                ...override,
                glob: new Glob(override.patterns, { root: this.#root }),
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
        const files = [];
        for (const base of bases) {
            files.push(...(await this.#glob.walk(base)));
        }
        const results = new Results(files);
        for (const file of files) {
            for (const checker of this.#checkers) {
                if (checker.glob.test(file)) {
                    let key = checker.patterns.join();
                    const values = [checker.linters];
                    for (const override of checker.overrides) {
                        if (override.glob.test(file)) {
                            key += "|" + override.patterns.join();
                            values.push(override.linters);
                        }
                    }

                    let wrappers = [];
                    if (this.#cache.has(key)) {
                        wrappers = this.#cache.get(key);
                    } else {
                        const linters = values.reduce(mergeLinters);
                        for (const linter of linters) {
                            wrappers.push(
                                // eslint-disable-next-line new-cap
                                new linter.wrapper(
                                    {
                                        fix: linter.fix,
                                        level: linter.level,
                                        root: this.#root,
                                        files,
                                    },
                                    linter.options,
                                ),
                            );
                        }
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
