/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import Results from "../../../src/core/results.js";
import Severities from "../../../src/core/severities.js";

describe("src/core/results.js", function () {
    describe("Results", function () {
        describe("constructor()", function () {
            it("should return undefined", function () {
                const results = new Results(["foo.mjs", "bar.cjs"]);
                const obj = results.toObject();
                assert.deepEqual(obj, {
                    "foo.mjs": undefined,
                    "bar.cjs": undefined,
                });
            });
        });

        describe("add()", function () {
            it("should support empty", function () {
                const results = new Results(["foo.css", "bar.php"]);
                results.add("foo.css", []);
                const obj = results.toObject();
                assert.deepEqual(obj, {
                    "foo.css": [],
                    "bar.php": undefined,
                });
            });

            it("should support notice", function () {
                const results = new Results(["foo.html", "bar.otf"]);
                results.add("foo.html", [
                    {
                        file: "foo.html",
                        linter: "htmllint",
                        rule: "baz",
                        severity: Severities.WARN,
                        message: "qux",
                        locations: [{ line: 42 }],
                    },
                ]);
                const obj = results.toObject();
                assert.deepEqual(obj, {
                    "foo.html": [
                        {
                            file: "foo.html",
                            linter: "htmllint",
                            rule: "baz",
                            severity: Severities.WARN,
                            message: "qux",
                            locations: [{ line: 42 }],
                        },
                    ],
                    "bar.otf": undefined,
                });
            });

            it("should use default", function () {
                const results = new Results(["foo.js"]);
                results.add("foo.js", [
                    {
                        file: "foo.js",
                        linter: "eslint",
                        message: "bar",
                    },
                ]);
                const obj = results.toObject();
                assert.deepEqual(obj, {
                    "foo.js": [
                        {
                            file: "foo.js",
                            linter: "eslint",
                            rule: undefined,
                            severity: Severities.ERROR,
                            message: "bar",
                            locations: [],
                        },
                    ],
                });
            });

            it("should suport sub-file", function () {
                const results = new Results(["foo"]);
                results.add("foo", [
                    {
                        file: "foo/bar.svg",
                        linter: "svglint",
                        message: "baz",
                    },
                ]);
                const obj = results.toObject();
                assert.deepEqual(obj, {
                    foo: [],
                    "foo/bar.svg": [
                        {
                            file: "foo/bar.svg",
                            linter: "svglint",
                            rule: undefined,
                            severity: Severities.ERROR,
                            message: "baz",
                            locations: [],
                        },
                    ],
                });
            });
        });

        describe("toObject()", function () {
            it("should sort notices", function () {
                const results = new Results(["foo.xml"]);
                results.add("foo.xml", [
                    {
                        file: "foo.xml",
                        linter: "prettier",
                        message: "one",
                        locations: [{ line: 42, column: 1 }],
                    },
                    {
                        file: "foo.xml",
                        linter: "prettier",
                        message: "two",
                        locations: [{ line: 42 }],
                    },
                    {
                        file: "foo.xml",
                        linter: "prettier",
                        message: "three",
                        locations: [{ line: 41, column: 2 }],
                    },
                    {
                        file: "foo.xml",
                        linter: "prettier",
                        message: "four",
                        locations: [{ line: 41, column: 2 }],
                    },
                    {
                        file: "foo.xml",
                        linter: "prettier",
                        message: "five",
                        locations: [{ line: 41, column: 1 }],
                    },
                    {
                        file: "foo.xml",
                        linter: "prettier",
                        message: "six",
                        locations: [],
                    },
                ]);
                const obj = results.toObject();
                assert.deepEqual(obj, {
                    "foo.xml": [
                        {
                            file: "foo.xml",
                            linter: "prettier",
                            rule: undefined,
                            severity: Severities.ERROR,
                            message: "six",
                            locations: [],
                        },
                        {
                            file: "foo.xml",
                            linter: "prettier",
                            rule: undefined,
                            severity: Severities.ERROR,
                            message: "five",
                            locations: [{ line: 41, column: 1 }],
                        },
                        {
                            file: "foo.xml",
                            linter: "prettier",
                            rule: undefined,
                            severity: Severities.ERROR,
                            message: "three",
                            locations: [{ line: 41, column: 2 }],
                        },
                        {
                            file: "foo.xml",
                            linter: "prettier",
                            rule: undefined,
                            severity: Severities.ERROR,
                            message: "four",
                            locations: [{ line: 41, column: 2 }],
                        },
                        {
                            file: "foo.xml",
                            linter: "prettier",
                            rule: undefined,
                            severity: Severities.ERROR,
                            message: "two",
                            locations: [{ line: 42 }],
                        },
                        {
                            file: "foo.xml",
                            linter: "prettier",
                            rule: undefined,
                            severity: Severities.ERROR,
                            message: "one",
                            locations: [{ line: 42, column: 1 }],
                        },
                    ],
                });
            });
        });
    });
});
