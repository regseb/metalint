/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import JSHintWrapper from "../../../../src/core/wrapper/jshint.js";

describe("src/core/wrapper/jshint.js", function () {
    describe("JSHintWrapper", function () {
        describe("lint()", function () {
            it("should ignore with FATAL level", async function () {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = {};
                // Utiliser un fichier qui n'existe pas pour faire échouer
                // l'enrobage si le fichier est analysé.
                const file = "foo";

                const wrapper = new JSHintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js": 'eval("bar");',
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = {};
                const file = "foo.js";

                const wrapper = new JSHintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "jshint",
                        rule: "W061",
                        severity: Severities.WARN,
                        message: "eval can be harmful.",
                        locations: [{ line: 1, column: 1 }],
                    },
                ]);
            });

            it("should return notices", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.js": `if (1 == "1") {
                                 console.log("bar");`,
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = { eqeqeq: true };
                const file = "foo.js";

                const wrapper = new JSHintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "jshint",
                        rule: "W116",
                        severity: Severities.WARN,
                        message: "Expected '===' and instead saw '=='.",
                        locations: [{ line: 1, column: 9 }],
                    },
                    {
                        file,
                        linter: "jshint",
                        rule: "E019",
                        severity: Severities.ERROR,
                        message: "Unmatched '{'.",
                        locations: [{ line: 1, column: 15 }],
                    },
                    {
                        file,
                        linter: "jshint",
                        rule: "E041",
                        severity: Severities.ERROR,
                        message: "Unrecoverable syntax error. (100% scanned).",
                        locations: [{ line: 2, column: 52 }],
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async function () {
                mock({ "foo.js": "const foo;" });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.js"],
                };
                const options = { eqeqeq: true };
                const file = "foo.js";

                const wrapper = new JSHintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "jshint",
                        rule: "E012",
                        severity: Severities.ERROR,
                        message: "Missing initializer for constant 'foo'.",
                        locations: [{ line: 1, column: 7 }],
                    },
                ]);
            });
        });
    });
});
