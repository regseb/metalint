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
import ESLintWrapper from "../../../../src/core/wrapper/eslint.js";

describe("src/core/wrapper/eslint.js", function () {
    describe("ESLintWrapper", function () {
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

                const wrapper = new ESLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async function () {
                mock({ "foo.js": 'console.log("bar");' });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = {};
                const file = "foo.js";

                const wrapper = new ESLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should fix", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js": "var bar = 42",
                });

                const context = {
                    level: Levels.INFO,
                    fix: true,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = { rules: { semi: "error" } };
                const file = "foo.js";

                const wrapper = new ESLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("foo.js", "utf8");
                assert.equal(content, "var bar = 42;");
            });

            it("should return notices", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js":
                        "var bar = 1;\n" +
                        "switch (bar) {\n" +
                        "    case 1: break;\n" +
                        "   case 2: break;\n" +
                        "    case 2: break;\n" +
                        "}",
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = {
                    rules: {
                        indent: [1, 4, { SwitchCase: 1 }],
                        "no-duplicate-case": 2,
                    },
                };
                const file = "foo.js";

                const wrapper = new ESLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "eslint",
                        rule: "indent",
                        severity: Severities.WARN,
                        message:
                            "Expected indentation of 4 spaces but found 3.",
                        locations: [
                            {
                                line: 4,
                                column: 1,
                                endLine: 4,
                                endColumn: 4,
                            },
                        ],
                    },
                    {
                        file,
                        linter: "eslint",
                        rule: "no-duplicate-case",
                        severity: Severities.ERROR,
                        message: "Duplicate case label.",
                        locations: [
                            {
                                line: 5,
                                column: 5,
                                endLine: 5,
                                endColumn: 19,
                            },
                        ],
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js": "var bar = 2 << 9; bar = bar;",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = {
                    rules: { "no-bitwise": 1, "no-self-assign": 2 },
                };
                const file = "foo.js";

                const wrapper = new ESLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "eslint",
                        rule: "no-self-assign",
                        severity: Severities.ERROR,
                        message: "'bar' is assigned to itself.",
                        locations: [
                            {
                                line: 1,
                                column: 25,
                                endLine: 1,
                                endColumn: 28,
                            },
                        ],
                    },
                ]);
            });

            it("should return FATAL notice", async function () {
                mock({ "foo.js": "var bar = ;" });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = {};
                const file = "foo.js";

                const wrapper = new ESLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "eslint",
                        rule: undefined,
                        severity: Severities.FATAL,
                        message: "Parsing error: Unexpected token ;",
                        locations: [{ line: 1, column: 11 }],
                    },
                ]);
            });

            it("should support plugins", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js":
                        "// filenames/no-index\n" +
                        "bar(function(baz) { return baz; });\n" +
                        "\n" +
                        "/**\n" +
                        " * Qux.\n" +
                        " *\n" +
                        " * @returns {Object} Quux.\n" +
                        " */\n" +
                        "function corge() { return {}; }",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = {
                    plugins: ["jsdoc", "mocha"],
                    rules: {
                        "jsdoc/check-types": 2,
                        "jsdoc/check-syntax": 2,
                        "mocha/prefer-arrow-callback": 2,
                    },
                };
                const file = "foo.js";

                const wrapper = new ESLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "eslint",
                        rule: "mocha/prefer-arrow-callback",
                        severity: Severities.ERROR,
                        message: "Unexpected function expression.",
                        locations: [
                            {
                                line: 2,
                                column: 5,
                                endLine: 2,
                                endColumn: 34,
                            },
                        ],
                    },
                    {
                        file,
                        linter: "eslint",
                        rule: "jsdoc/check-types",
                        severity: Severities.ERROR,
                        message:
                            'Invalid JSDoc @returns type "Object"; prefer:' +
                            ' "object".',
                        locations: [
                            {
                                line: 7,
                                column: 1,
                                endLine: 7,
                                endColumn: 1,
                            },
                        ],
                    },
                ]);
            });
        });
    });
});
