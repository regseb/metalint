"use strict";

const assert   = require("assert");
const SEVERITY = require("../../lib/severity");
const metalint = require("../../lib/index");

const DATA_DIR = "test/data/lib/index";

describe("lib/index.js", function () {
    it("", function () {
        const files    = [
            DATA_DIR + "/index.html", DATA_DIR + "/README.md",
            DATA_DIR + "/script.js"
        ];
        const checkers = [
            {
                "patterns": ["*.js"],
                "linters":  {
                    "./wrapper/jshint.js": null,
                    "./wrapper/jscs.js":   {
                        "disallowFunctionDeclarations": true,
                        "validateQuoteMarks":           "\""
                    }
                },
                "level":    SEVERITY.WARN
            }, {
                "patterns": ["*.html"],
                "linters":  {
                    "./wrapper/htmlhint.js": { "tagname-lowercase": true }
                },
                "level":    SEVERITY.FATAL
            }
        ];

        return metalint(files, checkers, DATA_DIR).then(function (results) {
            assert.deepStrictEqual(results, {
                [DATA_DIR + "/index.html"]: [],
                [DATA_DIR + "/README.md"]:  null,
                [DATA_DIR + "/script.js"]:  [
                    {
                        "file":      DATA_DIR + "/script.js",
                        "linter":    "jscs",
                        "rule":      "disallowFunctionDeclarations",
                        "severity":  SEVERITY.ERROR,
                        "message":   "Illegal function declaration",
                        "locations": [{ "line": 1, "column": 1 }]
                    }, {
                        "file":      DATA_DIR + "/script.js",
                        "linter":    "jscs",
                        "rule":      "validateQuoteMarks",
                        "severity":  SEVERITY.ERROR,
                        "message":   "Invalid quote mark found",
                        "locations": [{ "line": 2, "column": 11 }]
                    }, {
                        "file":      DATA_DIR + "/script.js",
                        "linter":    "jshint",
                        "rule":      "W033",
                        "severity":  SEVERITY.WARN,
                        "message":   "Missing semicolon.",
                        "locations": [{ "line": 2, "column": 26 }]
                    }
                ]
            });
        });
    });

    it("", function () {
        const files    = [DATA_DIR + "/README.md"];
        const checkers = [
            {
                "patterns": ["**"],
                "linters":  { "./wrapper/markdownlint.js": null },
                "level":    SEVERITY.INFO
            }
        ];

        return metalint(files, checkers, DATA_DIR).then(function (results) {
            assert.deepStrictEqual(results, {
                [DATA_DIR + "/README.md"]: [
                    {
                        "file":      DATA_DIR + "/README.md",
                        "linter":    "markdownlint",
                        "rule":      "MD002/first-heading-h1/first-header-h1",
                        "severity":  SEVERITY.ERROR,
                        "message":   "First heading should be a top level" +
                                          " heading [Expected: h1; Actual: h2]",
                        "locations": [{ "line": 1 }]
                    }, {
                        "file":      DATA_DIR + "/README.md",
                        "linter":    "markdownlint",
                        "rule":      "MD041/first-line-h1",
                        "severity":  SEVERITY.ERROR,
                        "message":   "First line in file should be a top" +
                                      " level heading [Context: \"## README\"]",
                        "locations": [{ "line": 1 }]
                    }
                ]
            });
        });
    });
});
