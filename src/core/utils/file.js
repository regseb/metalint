/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import fs from "node:fs/promises";

/**
 * Teste si un fichier existe.
 *
 * @param {string} path Le chemin du fichier.
 * @returns {Promise<boolean>} Une promesse avec <code>true</code> si le
 *                             fichier existe ; sinon <code>false</code>.
 */
export const exists = async function (path) {
    try {
        await fs.access(path, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
};
