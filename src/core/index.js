/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import { mergeLinters } from "./configuration/override.js";
import Severities from "./severities.js";
import Glob from "./utils/glob.js";

/**
 * @typedef {import("../type/index.d.ts").FlattenedConfigChecker} FlattenedConfigChecker
 * @typedef {import("../type/index.d.ts").Notice} Notice
 */

/**
 * Compare deux notifications. En commençant par le numéro de la ligne, puis
 * celui de la colonne.
 *
 * @param {Notice} notice1 La première notification.
 * @param {Notice} notice2 La seconde notification.
 * @returns {number} Un nombre négatif si la 1<sup>re</sup> notification est
 *                   inférieure à la 2<sup>de</sup> ; <code>0</code> si elles
 *                   sont égales ; sinon un nombre positif.
 */
const compare = function (notice1, notice2) {
    for (
        let i = 0;
        i < notice1.locations.length && i < notice2.locations.length;
        ++i
    ) {
        const locations1 = notice1.locations[i];
        const locations2 = notice2.locations[i];

        let diff = locations1.line - locations2.line;
        if (0 !== diff) {
            return diff;
        }

        diff = (locations1.column ?? -1) - (locations2.column ?? -1);
        if (0 !== diff) {
            return diff;
        }
    }
    return notice1.locations.length - notice2.locations.length;
};

const Results = class {
    /**
     * Les données des résultats.
     *
     * @type {Record<string, Notice[]|undefined>}
     */
    #data;

    constructor(files) {
        this.#data = Object.fromEntries(files.map((f) => [f, undefined]));
    }

    add(file, notices) {
        // Ajouter un tableau vide dans les données pour indiquer que le fichier
        // a été analysé par au moins un linter.
        if (undefined === this.#data[file]) {
            this.#data[file] = [];
        }
        for (const notice of notices) {
            // Vérifier aussi le fichier de la notification, car il peut être
            // différent du fichier d'origine (qui est peut-être un répertoire
            // ou une archive).
            if (undefined === this.#data[notice.file]) {
                this.#data[notice.file] = [];
            }
            this.#data[notice.file].push({
                rule: undefined,
                severity: Severities.ERROR,
                locations: [],
                ...notice,
            });
        }
    }

    toObject() {
        // Trier les notifications.
        Object.values(this.#data)
            .filter((r) => undefined !== r)
            .forEach((r) => r.sort(compare));
        return this.#data;
    }
};

/**
 * Vérifie (en appelant des linters) une liste de fichiers.
 *
 * @param {string[]}                 files    La liste des fichiers.
 * @param {FlattenedConfigChecker[]} checkers La liste des vérifications faites
 *                                            sur les fichiers.
 * @param {string}                   root     L'adresse du répertoire où se
 *                                            trouve le répertoire
 *                                            <code>.metalint/</code>.
 * @returns {Promise<Record<string, Notice[]|undefined>>} Une promesse
 *                                                        retournant la liste
 *                                                        des notifications
 *                                                        regroupées par
 *                                                        fichier.
 */
export default async function metalint(files, checkers, root) {
    const cache = new Map();
    const results = new Results(files);
    for (const file of files) {
        for (const checker of checkers) {
            const glob = new Glob(checker.patterns, { root });
            if (glob.test(file)) {
                const key = [glob];
                const values = [checker.linters];
                for (const override of checker.overrides) {
                    const subglob = new Glob(override.patterns, { root });
                    if (subglob.test(file)) {
                        key.push(subglob);
                        values.push(override.linters);
                    }
                }

                let wrappers = [];
                if (cache.has(key)) {
                    wrappers = cache.get(key);
                } else {
                    const linters = values.reduce(mergeLinters);
                    for (const linter of linters) {
                        wrappers.push(
                            // eslint-disable-next-line new-cap
                            new linter.wrapper(
                                {
                                    fix: linter.fix,
                                    level: linter.level,
                                    root,
                                    files,
                                },
                                linter.options,
                            ),
                        );
                    }
                    cache.set(key, wrappers);
                }
                for (const wrapper of wrappers) {
                    results.add(file, await wrapper.lint(file));
                }
            }
        }
    }

    return results.toObject();
}
