/**
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";

/**
 * La liste des répertoires et des fichiers à supprimer.
 *
 * @type {string[]}
 */
const PATHS = [
    // Supprimer les répertoires et les fichiers générés.
    ".stryker/",
    ".tmp/",
    "jsdocs/",
    "node_modules/",
    "stryker.log",
    "types/",
    // Supprimer les autres lockfiles.
    "bun.lockb",
    "pnpm-lock.yaml",
    "yarn.lock",
];

for (const path of PATHS) {
    await fs.rm(path, { force: true, recursive: true });
}
