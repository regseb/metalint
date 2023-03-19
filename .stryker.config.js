/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

/**
 * @type {import("@stryker-mutator/api/core").PartialStrykerOptions}
 */
export default {
    incremental: true,
    incrementalFile: ".stryker/stryker-incremental.json",
    ignoreStatic: true,
    // Utiliser inPlace car mock-fs ne fonctionne pas avec un lien symbolique
    // sur le répertoire node_modules.
    // https://github.com/stryker-mutator/stryker-js/issues/3978
    inPlace: true,
    mochaOptions: { config: "test/unit/mocharc.json" },
    mutate: ["src/core/**/*.js"],
    reporters: ["dots", "clear-text"],
    tempDirName: ".stryker/tmp/",
    testRunner: "mocha",
};
