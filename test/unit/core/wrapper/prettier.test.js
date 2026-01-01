/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import PrettierWrapper from "../../../../src/core/wrapper/prettier.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/prettier.js", () => {
    describe("PrettierWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(PrettierWrapper.configurable);
            });
        });

        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should ignore with OFF level", async () => {
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

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async () => {
                const root = await tempFs.create({ "foo.html": "<span />\n" });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.html"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.html";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should fix", async () => {
                const root = await tempFs.create({ "foo.html": "<img>" });

                const context = {
                    level: Levels.INFO,
                    fix: true,
                    root,
                    files: ["foo.html"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.html";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("foo.html", "utf8");
                assert.equal(content, "<img />\n");
            });

            it("shouldn't fix when no problem", async () => {
                const root = await tempFs.create({
                    "foo.html": "<title>Bar</title>\n",
                });
                const { mtimeMs } = await fs.stat("foo.html");
                // Attendre 10 ms pour être sûr d'avoir une date de modification
                // différente du fichier foo.html.
                await new Promise((resolve) => {
                    setTimeout(resolve, 10);
                });

                const context = {
                    level: Levels.INFO,
                    fix: true,
                    root,
                    files: ["foo.html"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.html";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("foo.html", "utf8");
                assert.equal(content, "<title>Bar</title>\n");
                // Vérifier que le fichier n'a pas été ré-écrit avec le même
                // contenu (en comparant la date de dernière modification).
                const stat = await fs.stat("foo.html");
                assert.equal(stat.mtimeMs, mtimeMs);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "foo.js": "const bar = 42;\n",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
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

            it("should ignore error with FATAL level", async () => {
                const root = await tempFs.create({
                    "foo.js": "const bar = 42;\n",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["foo.js"],
                };
                const options = { semi: false };
                const file = "foo.js";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return FATAL notice with locations", async () => {
                const root = await tempFs.create({
                    "foo.js":
                        "// Ajouter des lignes pour avoir le numéro de la \n" +
                        '// ligne avec deux chiffres (pour tester le "+" de\n' +
                        '// "\\d+".\n' +
                        "\n\n\n\n\n\n" +
                        'const bar = { "baz;\n',
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
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
                        locations: [{ line: 10, column: 15 }],
                    },
                ]);
            });

            it("should return default FATAL notice", async () => {
                const root = await tempFs.create({
                    "foo.php": "<?php echo 'bar'; ?>",
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
                    files: ["foo.php"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.php";

                const wrapper = new PrettierWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "prettier",
                        severity: Severities.FATAL,
                        message:
                            'No parser could be inferred for file "foo.php".',
                    },
                ]);
            });
        });
    });
});
