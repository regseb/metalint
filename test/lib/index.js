"use strict";

const assert   = require("assert");
const SEVERITY = require("../../lib/severity");
const metalint = require("../../lib/index");

const DATA_DIR = "../data/lib/index";

describe("lib/index.js", function () {
    it("", function () {
        const file     = DATA_DIR + "/script.js";
        const checkers = [
            {
                "linters": {
                    "jshint": null,
                    "jscs":   {
                        "disallowFunctionDeclarations": true,
                        "validateQuoteMarks":           "\""
                    }
                },
                "level": SEVERITY.ERROR
            }
        ];

        return metalint(file, checkers).then(function (notices) {
            const expected = [
                {
                    "linter":    "jscs",
                    "rule":      "disallowFunctionDeclarations",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Illegal function declaration",
                    "locations": [{ "line": 1, "column": 0 }]
                }, {
                    "linter":    "jscs",
                    "rule":      "validateQuoteMarks",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Invalid quote mark found",
                    "locations": [{ "line": 2, "column": 10 }]
                }, {
                    "linter":    "jshint",
                    "rule":      "W033",
                    "severity":  SEVERITY.WARN,
                    "message":   "Missing semicolon.",
                    "locations": [{ "line": 2, "column": 26 }]
                }
            ];
            assert.deepStrictEqual(notices, expected);
        });
    });

    it("", function () {
        const file     = DATA_DIR + "/README.md";
        const checkers = [
            {
                "linters": { "markdownlint": null },
                "level":   SEVERITY.INFO
            }
        ];

        return metalint(file, checkers).then(function (notices) {
            const expected = [
                {
                    "linter":    "markdownlint",
                    "rule":      "MD002/first-heading-h1/first-header-h1",
                    "severity":  SEVERITY.ERROR,
                    "message":   "First heading should be a top level heading" +
                                 " [Expected: h1; Actual: h2]",
                    "locations": [{ "line": 1 }]
                }, {
                    "linter":    "markdownlint",
                    "rule":      "MD041/first-line-h1",
                    "severity":  SEVERITY.ERROR,
                    "message":   "First line in file should be a top level" +
                                 " heading [Context: \"## README\"]",
                    "locations": [{ "line": 1 }]
                }
            ];
            assert.deepStrictEqual(notices, expected);
        });
    });
});
