/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import mock from "mock-fs";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import StandardWrapper from "../../../../src/core/wrapper/standard.js";

describe("src/core/wrapper/standard.js", function () {
    describe("StandardWrapper", function () {
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

                const wrapper = new StandardWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js": "var bar = 'baz'\n",
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = {};
                const file = "foo.js";

                const wrapper = new StandardWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "standard",
                        severity: Severities.WARN,
                        rule: "no-var",
                        message: "Unexpected var, use let or const instead.",
                        locations: [
                            {
                                line: 1,
                                column: 1,
                                endLine: 1,
                                endColumn: 16,
                            },
                        ],
                    },
                    {
                        file,
                        linter: "standard",
                        severity: Severities.ERROR,
                        rule: "no-unused-vars",
                        message: "'bar' is assigned a value but never used.",
                        locations: [
                            {
                                line: 1,
                                column: 5,
                                endLine: 1,
                                endColumn: 8,
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
                    "foo.js": "var bar = 'baz'\n",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = {};
                const file = "foo.js";

                const wrapper = new StandardWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "standard",
                        severity: Severities.ERROR,
                        rule: "no-unused-vars",
                        message: "'bar' is assigned a value but never used.",
                        locations: [
                            {
                                line: 1,
                                column: 5,
                                endLine: 1,
                                endColumn: 8,
                            },
                        ],
                    },
                ]);
            });

            it("should return FATAL notice", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js": "const bar = ;\n",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = {};
                const file = "foo.js";

                const wrapper = new StandardWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "standard",
                        rule: undefined,
                        severity: Severities.FATAL,
                        message: "Parsing error: Unexpected token ;",
                        locations: [{ line: 1, column: 13 }],
                    },
                ]);
            });
        });
    });
});
