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
import StylelintWrapper from "../../../../src/core/wrapper/stylelint.js";

describe("src/core/wrapper/stylelint.js", function () {
    describe("StylelintWrapper", function () {
        describe("lint()", function () {
            it("should fix", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.css": "header { top: 0px; }",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: true,
                    root: process.cwd(),
                    files: ["foo.css"],
                };
                const options = { rules: { "length-zero-no-unit": true } };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("foo.css", "utf8");
                assert.equal(content, "header { top: 0; }");
            });

            it("should ignore with FATAL level and no fix", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.css": "a { animation: 80ms; }",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.css"],
                };
                const options = {
                    "time-min-milliseconds": 100,
                };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.css": "div {}",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.css"],
                };
                const options = { rules: {} };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("shouldn't return notice", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.css": "a { color: #FFFFFF; }",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.css"],
                };
                const options = { rules: { "color-hex-case": "upper" } };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.css":
                        "p { font-size: .5em }\n" +
                        "label::after { content: 'bar'; }",
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.css"],
                };
                const options = {
                    rules: {
                        "number-leading-zero": [
                            "always",
                            { severity: "warning" },
                        ],
                        "string-quotes": "double",
                    },
                };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "stylelint",
                        rule: "number-leading-zero",
                        severity: Severities.WARN,
                        message: "Expected a leading zero",
                        locations: [{ line: 1, column: 16 }],
                    },
                    {
                        file,
                        linter: "stylelint",
                        rule: "string-quotes",
                        severity: Severities.ERROR,
                        message: "Expected double quotes",
                        locations: [{ line: 2, column: 25 }],
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo.css": "span {\n    color: #bar;\n}",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.css"],
                };
                const options = {
                    rules: {
                        "color-no-invalid-hex": true,
                        indentation: [2, { severity: "warning" }],
                    },
                };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "stylelint",
                        rule: "color-no-invalid-hex",
                        severity: Severities.ERROR,
                        message: 'Unexpected invalid hex color "#bar"',
                        locations: [{ line: 2, column: 12 }],
                    },
                ]);
            });

            it("should lint all files (cf. disableDefaultIgnores)", async function () {
                mock({
                    // Ne pas simuler le répertoire "node_modules" car le linter
                    // doit accéder à des fichiers dans celui-ci.
                    "node_modules/": mock.load("node_modules/"),
                    "foo/node_modules/bar.css": "main { width: 100baz; }",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo/node_modules/bar.css"],
                };
                const options = { rules: { "unit-no-unknown": true } };
                const file = "foo/node_modules/bar.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "stylelint",
                        rule: "unit-no-unknown",
                        severity: Severities.ERROR,
                        message: 'Unexpected unknown unit "baz"',
                        locations: [{ line: 1, column: 18 }],
                    },
                ]);
            });
        });
    });
});
