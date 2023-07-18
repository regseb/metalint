/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import process from "node:process";
import mock from "mock-fs";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import SortPackageJsonWrapper from "../../../../src/core/wrapper/sort-package-json.js";

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
                const options = {};
                // Utiliser un fichier qui n'existe pas pour faire échouer
                // l'enrobage si le fichier est analysé.
                const file = "foo";

                const wrapper = new SortPackageJsonWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should fix", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json": '{"version": "1.0.0","name":"foo"}',
                });

                const context = {
                    level: Levels.OFF,
                    fix: true,
                    root: process.cwd(),
                    files: ["package.json"],
                };
                const options = {};
                const file = "package.json";

                const wrapper = new SortPackageJsonWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("package.json", "utf8");
                assert.equal(content, '{"name":"foo","version":"1.0.0"}');
            });

            it("shouldn't fix when no problem", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json": '{"name":"foo"}',
                });
                // Attendre 10 ms pour être sûr d'avoir une date de modification
                // différente de la date de création du fichier package.json.
                await new Promise((resolve) => {
                    setTimeout(resolve, 10);
                });

                const context = {
                    level: Levels.INFO,
                    fix: true,
                    root: process.cwd(),
                    files: ["package.json"],
                };
                const options = {};
                const file = "package.json";

                const wrapper = new SortPackageJsonWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("package.json", "utf8");
                assert.equal(content, '{"name":"foo"}');
                // Vérifier que le fichier n'a pas été ré-écrit avec le même
                // contenu (en comparant la date de création et celle de
                // dernière modification).
                const stat = await fs.stat("package.json");
                assert.equal(stat.mtimeMs, stat.birthtimeMs);
            });

            it("should return notices", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json": '{"version":"1.0.0","name":"foo"}',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
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
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json": '{"version":"1.0.0","name":"foo"}',
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["package.json"],
                };
                const options = { semi: false };
                const file = "package.json";

                const wrapper = new SortPackageJsonWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return FATAL notice", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "package.json": "name=foo",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
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
                        message: "Unexpected token a in JSON at position 1",
                    },
                ]);
            });
        });
    });
});
