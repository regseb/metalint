"use strict";

const assert   = require("assert");
const SEVERITY = require("../../lib/severity");
const metalint = require("../../lib/index");

const DATA_DIR = "../data/lib/index";

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
                    "jshint": null,
                    "jscs":   {
                        "disallowFunctionDeclarations": true,
                        "validateQuoteMarks":           "\""
                    }
                },
                "level":    SEVERITY.ERROR
            }, {
                "patterns": ["*.html"],
                "linters":  {
                    "htmlhint": { "tagname-lowercase": true }
                },
                "level":    SEVERITY.FATAL
            }
        ];

        let count = 0;
        return metalint(files, checkers, DATA_DIR, function (file, notices) {
            const expected = {};
            switch (count) {
                case 0:
                    expected.file = DATA_DIR + "/index.html";
                    expected.notices = [];
                    break;
                case 1:
                    expected.file = DATA_DIR + "/README.md";
                    expected.notices = null;
                    break;
                case 2:
                    expected.file = DATA_DIR + "/script.js";
                    expected.notices = [
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
                    break;
                default:
                    assert.fail();
            }
            ++count;
            assert.strictEqual(file, expected.file);
            assert.deepStrictEqual(notices, expected.notices);
        }).then(function (severity) {
            assert.strictEqual(severity, SEVERITY.ERROR);
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
