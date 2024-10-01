/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import process from "node:process";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import SortPackageJsonWrapper from "../../../../src/core/wrapper/sort-package-json.js";
import createTempFileSystem from "../../../utils/fake.js";

describe("src/core/wrapper/sort-package-json.js", function () {
    describe("SortPackageJsonWrapper", function () {
        describe("lint()", function () {
            it("should ignore with OFF level and no fix", async function () {
                const context = {
                    level: Levels.OFF,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                // Utiliser un fichier qui n'existe pas pour faire échouer
                // l'enrobage si le fichier est analysé.
                const file = "foo";

                const wrapper = new SortPackageJsonWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should fix", async function () {
                const root = await createTempFileSystem({
                    "package.json": '{"version": "1.0.0","name":"foo"}',
                });

                const context = {
                    level: Levels.OFF,
                    fix: true,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new SortPackageJsonWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("package.json", "utf8");
                assert.equal(content, '{"name":"foo","version":"1.0.0"}');
            });

            it("shouldn't fix when no problem", async function () {
                const root = await createTempFileSystem({
                    "package.json": '{"name":"foo"}',
                });
                const { mtimeMs } = await fs.stat("package.json");
                // Attendre 10 ms pour être sûr d'avoir une date de modification
                // différente du fichier package.json.
                await new Promise((resolve) => {
                    setTimeout(resolve, 10);
                });

                const context = {
                    level: Levels.INFO,
                    fix: true,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new SortPackageJsonWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("package.json", "utf8");
                assert.equal(content, '{"name":"foo"}');
                // Vérifier que le fichier n'a pas été ré-écrit avec le même
                // contenu (en comparant la date de dernière modification).
                const stat = await fs.stat("package.json");
                assert.equal(stat.mtimeMs, mtimeMs);
            });

            it("should return notices", async function () {
                const root = await createTempFileSystem({
                    "package.json": '{"version":"1.0.0","name":"foo"}',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = { semi: false };
                const file = "package.json";

                const wrapper = new SortPackageJsonWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "sort-package-json",
                        message: "File was not sorted.",
                    },
                ]);
            });

            it("should ignore error with FATAL level", async function () {
                const root = await createTempFileSystem({
                    "package.json": '{"version":"1.0.0","name":"foo"}',
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = { semi: false };
                const file = "package.json";

                const wrapper = new SortPackageJsonWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return FATAL notice", async function () {
                const root = await createTempFileSystem({
                    "package.json": "name=foo",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = { semi: false };
                const file = "package.json";

                const wrapper = new SortPackageJsonWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "sort-package-json",
                        severity: Severities.FATAL,
                        message:
                            "Unexpected token 'a', \"name=foo\" is not valid" +
                            " JSON",
                    },
                ]);
            });
        });
    });
});
