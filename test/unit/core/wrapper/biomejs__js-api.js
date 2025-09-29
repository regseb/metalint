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
                        rule: "correctness/noUnusedVariables",
                        severity: Severities.WARN,
                        message: "This variable bar is unused.",
                        locations: [
                            { line: 1, column: 7, endLine: 1, endColumn: 10 },
                        ],
                    },
                    {
                        file,
                        linter: "biomejs__js-api",
                        severity: Severities.ERROR,
                        message: "Code style issues found.",
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
                    "foo.js": "let bar = undefined;\n",
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
                        rule: "complexity/noUselessUndefinedInitialization",
                        severity: Severities.INFO,
                        message:
                            "It's not necessary to initialize bar to" +
                            " undefined.",
                        locations: [
                            { line: 1, column: 9, endLine: 1, endColumn: 20 },
                        ],
                    },
                    {
                        file,
                        linter: "biomejs__js-api",
                        rule: "style/useConst",
                        severity: Severities.WARN,
                        message:
                            "This let declares a variable that is only" +
                            " assigned once.",
                        locations: [
                            { line: 1, column: 1, endLine: 1, endColumn: 4 },
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
                        rule: "correctness/noUnusedVariables",
                        severity: Severities.ERROR,
                        message: "This function bar is unused.",
                        locations: [
                            { line: 1, column: 10, endLine: 1, endColumn: 13 },
                        ],
                    },
                    {
                        file,
                        linter: "biomejs__js-api",
                        severity: Severities.ERROR,
                        message: "Code style issues found.",
                    },
                ]);
            });

            it("should recalculate position", async () => {
                const root = await tempFs.create({
                    "foo.js":
                        "/* Aéअ */ const bar = true;\n" +
                        "/* \u007F\u0080\u07FF\u0800\uD800\uDBFF\uDC00\uDFFF */ const baz" +
                        " = false;\n",
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
                        rule: "correctness/noUnusedVariables",
                        severity: Severities.WARN,
                        message: "This variable bar is unused.",
                        locations: [
                            { line: 1, column: 17, endLine: 1, endColumn: 20 },
                        ],
                    },
                    {
                        file,
                        linter: "biomejs__js-api",
                        rule: "correctness/noUnusedVariables",
                        severity: Severities.WARN,
                        message: "This variable baz is unused.",
                        locations: [
                            { line: 2, column: 22, endLine: 2, endColumn: 25 },
                        ],
                    },
                ]);
            });
        });
    });
});
