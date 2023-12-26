/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import JSZip from "jszip";

/**
 * Les répertoires temporaires créés avec le précédent répertoire courant.
 *
 * @type {Object[]}
 */
const temps = [];

/**
 * Supprime les répertoires temporaires et retourne sur le répertoire courant.
 */
export const restore = async () => {
    for (const temp of temps) {
        await fs.rm(temp.root, { force: true, recursive: true });
        process.chdir(temp.cwd);
    }
    temps.length = 0;
};

/**
 * Remplit un zip avec des fichiers.
 *
 * @param {JSZip}                         zip   Le fichier zip.
 * @param {Object<string, Object|string>} files La liste des fichiers.
 */
const fillZip = (zip, files) => {
    for (const [filename, content] of Object.entries(files)) {
        if (filename.includes("/")) {
            fillZip(
                zip,
                filename
                    .split("/")
                    .reduceRight(
                        (acc, current) => ({ [current]: acc }),
                        content,
                    ),
            );
        } else if ("object" === typeof content) {
            const folder = zip.folder(filename);
            fillZip(folder, content);
        } else {
            zip.file(filename, content);
        }
    }
};

/**
 * Crée un zip avec des fichiers.
 *
 * @param {string}                        parent Le chemin du fichier zip parent.
 * @param {Object<string, Object|string>} files  La liste des fichiers.
 */
const createZip = (parent, files) => {
    const zip = new JSZip();
    fillZip(zip, files);
    return new Promise((resolve) => {
        zip.generateNodeStream({ streamFiles: true })
            .pipe(createWriteStream(parent))
            .on("finish", resolve);
    });
};

/**
 * Crée une arborescence avec des fichiers.
 *
 * @param {string}                        parent Le chemin du parent.
 * @param {Object<string, Object|string>} files  La liste des fichiers.
 */
const createTree = async (parent, files) => {
    for (const [filename, content] of Object.entries(files)) {
        if (filename.includes("/")) {
            await createTree(
                parent,
                filename
                    .split("/")
                    .reduceRight(
                        (acc, current) => ({ [current]: acc }),
                        content,
                    ),
            );
        } else {
            const file = path.join(parent, filename);
            if (file.endsWith(".zip") || file.endsWith(".xpi")) {
                await createZip(file, content);
            } else if ("object" === typeof content) {
                await fs.mkdir(file);
                await createTree(file, content);
            } else {
                await fs.writeFile(file, content);
            }
        }
    }
};

/**
 * Crée un <em>file system</em> dans un répertoire temporaire.
 *
 * @param {Object} files Les fichiers à créer dans le répertoire.
 * @returns {Promise<string>} Le chemin vers le répertoire temporaire.
 */
export default async function createTempFileSystem(files) {
    const tmp = path.join(process.cwd(), "tmp");
    await fs.mkdir(tmp, { recursive: true });
    const root = await fs.mkdtemp(path.join(tmp, "filesystem-"));
    temps.unshift({ root, cwd: process.cwd() });
    process.chdir(root);
    await createTree(root, files);
    return root;
}
