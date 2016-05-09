"use strict";

const assert   = require("assert");
const SEVERITY = require("../../lib/severity.js");
const metalint = require("../../lib/index.js");

describe("lib/index.js", function () {
    it("", function () {
        const source =
            "function hello() {\n" +
            "    alert('Hello World!')\n" +
            "}\n";
        const checkers = [
            {
                "linters": {
                    "jshint": null,
                    "jscs": { "disallowFunctionDeclarations": true,
                              "validateQuoteMarks": "\"" }
                },
                "level": SEVERITY.ERROR
            }
        ];

        return metalint(source, checkers).then(function (notices) {
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
                    "locations": [{ "line": 2, "column": 17 }]
                }, {
                    "linter":    "jshint",
                    "rule":      "W033",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Missing semicolon.",
                    "locations": [{ "line": 2, "column": 26 }]
                }
            ];
            assert.deepStrictEqual(notices, expected);
        });
    });

    it("", function () {
        const source = "## README\n";
        const checkers = [
            {
                "linters": {
                    "markdownlint": null
                },
                "level": SEVERITY.INFO
            }
        ];

        return metalint(source, checkers).then(function (notices) {
            const expected = [
                {
                    "linter":    "markdownlint",
                    "rule":      "MD002",
                    "severity":  SEVERITY.ERROR,
                    "message":   "First header should be a h1 header",
                    "locations": [{ "line": 1 }]
                }, {
                    "linter":    "markdownlint",
                    "rule":      "MD041",
                    "severity":  SEVERITY.ERROR,
                    "message":   "First line in file should be a top level" +
                                 " header",
                    "locations": [{ "line": 1 }]
                }
            ];
            assert.deepStrictEqual(notices, expected);
        });
    });
});
