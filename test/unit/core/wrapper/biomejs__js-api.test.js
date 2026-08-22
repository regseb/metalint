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
import BiomeJsJsApiWrapper from "../../../../src/core/wrapper/biomejs__js-api.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/biomejs__js-api.js", () => {
    describe("BiomeJsJsApiWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(BiomeJsJsApiWrapper.configurable);
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

                const wrapper = new BiomeJsJsApiWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async () => {
                const root = await tempFs.create({
                    "foo.js": "const bar = 43",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.js"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.js";

                const wrapper = new BiomeJsJsApiWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "biomejs__js-api",
                        severity: Severities.ERROR,
                        message: "Code style issues found.",
                    },
                    {
                        file,
                        linter: "biomejs__js-api",
                        rule: "lint/correctness/noUnusedVariables",
                        severity: Severities.WARN,
                        message: "This variable bar is unused.",
                        locations: [
                            { line: 1, column: 7, endLine: 1, endColumn: 10 },
                        ],
                    },
                ]);
            });

            it("should ignore formatter", async () => {
                const root = await tempFs.create({
                    "foo.js": "export     const     bar='baz'",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.js"],
                };
                const options = { formatter: { enabled: false } };
                const file = "foo.js";

                const wrapper = new BiomeJsJsApiWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("foo.js", "utf8");
                assert.equal(content, "export     const     bar='baz'");
            });

            it("should return notices style", async () => {
                const root = await tempFs.create({
                    "foo.js": "console.log ('bar')",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.js"],
                };
                const options = {
                    linter: {
                        rules: { correctness: { noUnusedVariables: "off" } },
                    },
                };
                const file = "foo.js";

                const wrapper = new BiomeJsJsApiWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "biomejs__js-api",
                        severity: Severities.ERROR,
                        message: "Code style issues found.",
                    },
                ]);
            });

            it("should fix", async () => {
                const root = await tempFs.create({
                    "foo.js": " Math . max ( 42 , 43 ) ",
                });

                const context = {
                    level: Levels.INFO,
                    fix: true,
                    root,
                    files: ["foo.js"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.js";

                const wrapper = new BiomeJsJsApiWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("foo.js", "utf8");
                assert.equal(content, "Math.max(42, 43);\n");
            });

            it("should ignore linter", async () => {
                const root = await tempFs.create({
                    "foo.js": "const bar = 0;\n",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.js"],
                };
                const options = { linter: { enabled: false } };
                const file = "foo.js";

                const wrapper = new BiomeJsJsApiWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "foo.js":
                        'import baz from "baz";\n' +
                        'import bar from "bar";\n' +
                        "let qux = bar + baz;\n",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.js"],
                };
                const options = {
                    linter: {
                        rules: { correctness: { noUnusedVariables: "off" } },
                    },
                };
                const file = "foo.js";

                const wrapper = new BiomeJsJsApiWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "biomejs__js-api",
                        rule: "assist/source/organizeImports",
                        severity: Severities.INFO,
                        message: "Some imports or exports are not organized.",
                        locations: [
                            { line: 1, column: 1, endLine: 3, endColumn: 21 },
                        ],
                    },
                    {
                        file,
                        linter: "biomejs__js-api",
                        rule: "lint/style/useConst",
                        severity: Severities.WARN,
                        message:
                            "This let declares a variable that is only" +
                            " assigned once.",
                        locations: [
                            { line: 3, column: 1, endLine: 3, endColumn: 4 },
                        ],
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async () => {
                const root = await tempFs.create({
                    "foo.js": "function bar(baz) { return true; }",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.js"],
                };
                const options = {
                    linter: {
                        rules: { correctness: { noUnusedVariables: "error" } },
                    },
                };
                const file = "foo.js";

                const wrapper = new BiomeJsJsApiWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "biomejs__js-api",
                        severity: Severities.ERROR,
                        message: "Code style issues found.",
                    },
                    {
                        file,
                        linter: "biomejs__js-api",
                        rule: "lint/correctness/noUnusedVariables",
                        severity: Severities.ERROR,
                        message: "This function bar is unused.",
                        locations: [
                            { line: 1, column: 10, endLine: 1, endColumn: 13 },
                        ],
                    },
                ]);
            });

            it("should recalculate position", async () => {
                const root = await tempFs.create({
                    "foo.js":
                        "/* Aéअ */ const bar = true;\n" +
                        "/* \u{7F}\u{80}\u{7FF}\u{800}\u{D800}\u{DBFF}" +
                        "\u{DC00}\u{DFFF} */ const baz = false;\n",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.js"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.js";

                const wrapper = new BiomeJsJsApiWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "biomejs__js-api",
                        rule: "lint/correctness/noUnusedVariables",
                        severity: Severities.WARN,
                        message: "This variable bar is unused.",
                        locations: [
                            { line: 1, column: 17, endLine: 1, endColumn: 20 },
                        ],
                    },
                    {
                        file,
                        linter: "biomejs__js-api",
                        rule: "lint/correctness/noUnusedVariables",
                        severity: Severities.WARN,
                        message: "This variable baz is unused.",
                        locations: [
                            { line: 2, column: 22, endLine: 2, endColumn: 25 },
                        ],
                    },
                ]);
            });

            it("should return FATAL notice", async () => {
                const root = await tempFs.create({
                    "foo.bar": "Baz",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.bar"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.bar";

                const wrapper = new BiomeJsJsApiWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "biomejs__js-api",
                        severity: Severities.FATAL,
                        message:
                            "The file foo.bar does not exist in the workspace.",
                    },
                ]);
            });
        });
    });
});
