/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import mock from "mock-fs";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import PrettierWrapper from "../../../../src/core/wrapper/prettier.js";

describe("src/core/wrapper/prettier.js", function () {
    describe("PrettierWrapper", function () {
        describe("lint()", function () {
            it("should ignore with OFF level", async function () {
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

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.html": "<span />\n",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.html"],
                };
                const options = {};
                const file = "foo.html";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should fix", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.html": "<img>",
                });

                const context = {
                    level: Levels.INFO,
                    fix: true,
                    root: process.cwd(),
                    files: ["foo.html"],
                };
                const options = {};
                const file = "foo.html";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("foo.html", "utf8");
                assert.equal(content, "<img />\n");
            });

            it("shouldn't fix when no problem", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.html": "<title>Bar</title>\n",
                });

                const context = {
                    level: Levels.INFO,
                    fix: true,
                    root: process.cwd(),
                    files: ["foo.html"],
                };
                const options = {};
                const file = "foo.html";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("foo.html", "utf8");
                assert.equal(content, "<title>Bar</title>\n");
                // Vérifier que le fichier n'a pas été ré-écrit avec le même
                // contenu (en comparant la date de création et celle de
                // dernière modification).
                const stat = await fs.stat("foo.html");
                assert.equal(stat.mtimeMs, stat.ctimeMs);
            });

            it("should return notices", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js": "const bar = 42;\n",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = { semi: false };
                const file = "foo.js";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "prettier",
                        message: "Code style issues found.",
                    },
                ]);
            });

            it("should ignore error with FATAL level", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js": "const bar = 42;\n",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = { semi: false };
                const file = "foo.js";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return FATAL notice", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js": 'const bar = { "baz;\n',
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = { semi: false };
                const file = "foo.js";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "prettier",
                        severity: Severities.FATAL,
                        message: "Unterminated string constant.",
                        locations: [{ line: 1, column: 15 }],
                    },
                ]);
            });

            it("should return FATAL notice with 'loc'", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.php": "<?php echo 'bar'; ?>",
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.php"],
                };
                const options = {};
                const file = "foo.php";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "prettier",
                        severity: Severities.FATAL,
                        message: "No parser could be inferred for file.",
                    },
                ]);
            });
        });
    });
});
