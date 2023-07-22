/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import metalint from "../../../src/core/index.js";
import Levels from "../../../src/core/levels.js";
import Severities from "../../../src/core/severities.js";
import AddonsLinterWrapper from "../../../src/core/wrapper/addons-linter.js";
import ESLintWrapper from "../../../src/core/wrapper/eslint.js";
import HTMLHintWrapper from "../../../src/core/wrapper/htmlhint.js";
import JSHintWrapper from "../../../src/core/wrapper/jshint.js";
import Prettier from "../../../src/core/wrapper/prettier.js";

describe("src/core/index.js", function () {
    describe("metalint()", function () {
        it("should return notices", async function () {
            mock({
                "src/core/": mock.load("src/core/"),
                "node_modules/": mock.load("node_modules/"),
                "foo.html": "<HTML></HTML>",
                "bar.md": "## baz",
                "qux.js": "alert('quux')",
            });

            const files = ["foo.html", "bar.md", "qux.js"];
            const checkers = [
                {
                    patterns: ["*.js"],
                    linters: [
                        {
                            wrapper: JSHintWrapper,
                            level: Levels.WARN,
                            fix: false,
                            options: {},
                        },
                        {
                            wrapper: ESLintWrapper,
                            level: Levels.WARN,
                            fix: false,
                            options: {
                                rules: {
                                    "no-alert": "error",
                                    quotes: "error",
                                },
                            },
                        },
                    ],
                    overrides: [],
                },
                {
                    patterns: ["*.html"],
                    linters: [
                        {
                            wrapper: HTMLHintWrapper,
                            level: Levels.FATAL,
                            fix: false,
                            options: { "tagname-lowercase": true },
                        },
                    ],
                    overrides: [],
                },
            ];

            const results = await metalint(files, checkers, ".");
            assert.deepEqual(results, {
                "foo.html": [],
                "bar.md": undefined,
                "qux.js": [
                    {
                        file: "qux.js",
                        linter: "eslint",
                        rule: "no-alert",
                        severity: Severities.ERROR,
                        message: "Unexpected alert.",
                        locations: [
                            {
                                line: 1,
                                column: 1,
                                endLine: 1,
                                endColumn: 14,
                            },
                        ],
                    },
                    {
                        file: "qux.js",
                        linter: "eslint",
                        rule: "quotes",
                        severity: Severities.ERROR,
                        message: "Strings must use doublequote.",
                        locations: [
                            {
                                line: 1,
                                column: 7,
                                endLine: 1,
                                endColumn: 13,
                            },
                        ],
                    },
                    {
                        file: "qux.js",
                        linter: "jshint",
                        rule: "W033",
                        severity: Severities.WARN,
                        message: "Missing semicolon.",
                        locations: [{ line: 1, column: 14 }],
                    },
                ],
            });
        });

        it("should add default properties", async function () {
            mock({
                "src/core/": mock.load("src/core/"),
                "node_modules/": mock.load("node_modules/"),
                "foo.json": '{"bar":"baz"}',
            });

            const files = ["foo.json"];
            const checkers = [
                {
                    patterns: ["**"],
                    linters: [
                        {
                            wrapper: Prettier,
                            level: Levels.INFO,
                            fix: false,
                            options: {},
                        },
                    ],
                    overrides: [],
                },
            ];

            const results = await metalint(files, checkers, ".");
            assert.deepEqual(results, {
                "foo.json": [
                    {
                        file: "foo.json",
                        linter: "prettier",
                        rule: undefined,
                        severity: Severities.ERROR,
                        message: "Code style issues found.",
                        locations: [],
                    },
                ],
            });
        });

        it("should support sub-files", async function () {
            mock({
                "src/core/": mock.load("src/core/"),
                "node_modules/": mock.load("node_modules/"),
                "foo/manifest.json": "{ 'name': 'foo' }",
            });

            const files = ["foo/"];
            const checkers = [
                {
                    patterns: ["foo/"],
                    linters: [
                        {
                            wrapper: AddonsLinterWrapper,
                            level: Levels.INFO,
                            fix: false,
                            options: {},
                        },
                    ],
                    overrides: [],
                },
            ];

            const results = await metalint(files, checkers, ".");
            assert.deepEqual(results, {
                "foo/": [
                    {
                        file: "foo/",
                        linter: "addons-linter",
                        rule: "JSON_INVALID",
                        severity: Severities.ERROR,
                        message: "Your JSON is not valid.",
                        locations: [],
                    },
                ],
                "foo/manifest.json": [
                    {
                        file: "foo/manifest.json",
                        linter: "addons-linter",
                        rule: "JSON_INVALID",
                        severity: Severities.ERROR,
                        message: "Your JSON is not valid.",
                        locations: [],
                    },
                ],
            });
        });
    });
});
