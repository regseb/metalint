/* global require, describe, it */

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
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Illegal function declaration",
                    "locations": [{ "line": 1, "column": 0 }]
                }, {
                    "linter":    "jscs",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Invalid quote mark found",
                    "locations": [{ "line": 2, "column": 10 }]
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
});
