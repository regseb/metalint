/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import Metalint from "../../../src/core/index.js";
import Levels from "../../../src/core/levels.js";
import Severities from "../../../src/core/severities.js";
import AddonsLinterWrapper from "../../../src/core/wrapper/addons-linter.js";
import ESLintWrapper from "../../../src/core/wrapper/eslint.js";
import HTMLHintWrapper from "../../../src/core/wrapper/htmlhint.js";
import JSHintWrapper from "../../../src/core/wrapper/jshint.js";
import MarkdownlintWrapper from "../../../src/core/wrapper/markdownlint.js";
import PrettierWrapper from "../../../src/core/wrapper/prettier.js";
import createTempFileSystem from "../../utils/fake.js";

describe("src/core/index.js", function () {
    describe("Metalint", function () {
        describe("lintFiles()", function () {
            it("should return notices", async function () {
                await createTempFileSystem({
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
                                options:
                                    /** @type {Record<string, unknown>} */ ({}),
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

                const metalint = new Metalint(
                    {
                        patterns: ["**"],
                        reporters: [],
                        checkers,
                    },
                    { root: "." },
                );
                const results = await metalint.lintFiles(files);
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
                await createTempFileSystem({
                    "foo.json": '{"bar":"baz"}',
                });

                const files = ["foo.json"];
                const checkers = [
                    {
                        patterns: ["**"],
                        linters: [
                            {
                                wrapper: PrettierWrapper,
                                level: Levels.INFO,
                                fix: false,
                                options:
                                    /** @type {Record<string, unknown>} */ ({}),
                            },
                        ],
                        overrides: [],
                    },
                ];

                const metalint = new Metalint(
                    {
                        patterns: ["**"],
                        reporters: [],
                        checkers,
                    },
                    { root: "." },
                );
                const results = await metalint.lintFiles(files);
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
                await createTempFileSystem({
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
                                options:
                                    /** @type {Record<string, unknown>} */ ({}),
                            },
                        ],
                        overrides: [],
                    },
                ];

                const metalint = new Metalint(
                    {
                        patterns: ["**"],
                        reporters: [],
                        checkers,
                    },
                    { root: "." },
                );
                const results = await metalint.lintFiles(files);
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

            it("should support same patterns", async function () {
                await createTempFileSystem({
                    "README.md": "# Foo",
                });

                const files = ["README.md"];
                const checkers = [
                    {
                        patterns: ["*.md"],
                        linters: [
                            {
                                wrapper: MarkdownlintWrapper,
                                level: Levels.INFO,
                                fix: false,
                                options:
                                    /** @type {Record<string, unknown>} */ ({}),
                            },
                        ],
                        overrides: [],
                    },
                    {
                        patterns: ["*.md"],
                        linters: [
                            {
                                wrapper: PrettierWrapper,
                                level: Levels.INFO,
                                fix: false,
                                options:
                                    /** @type {Record<string, unknown>} */ ({}),
                            },
                        ],
                        overrides: [],
                    },
                ];

                const metalint = new Metalint(
                    {
                        patterns: ["**"],
                        reporters: [],
                        checkers,
                    },
                    { root: "." },
                );
                const results = await metalint.lintFiles(files);
                assert.deepEqual(results, {
                    "README.md": [
                        {
                            file: "README.md",
                            linter: "prettier",
                            rule: undefined,
                            severity: Severities.ERROR,
                            message: "Code style issues found.",
                            locations: [],
                        },
                        {
                            file: "README.md",
                            linter: "markdownlint",
                            rule: "MD047/single-trailing-newline",
                            severity: Severities.ERROR,
                            message:
                                "Files should end with a single newline character []",
                            locations: [{ line: 1 }],
                        },
                    ],
                });
            });
        });
    });
});
