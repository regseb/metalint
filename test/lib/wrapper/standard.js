/* global require, describe, it */

"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/standard.js");

describe("lib/wrapper/standard.js", function () {
    it("", function () {
        const source = "var text = \"Hello World\"\n";
        const options = {};
        const level = SEVERITY.ERROR;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "standard",
                    "rule":      "no-unused-vars",
                    "severity":  SEVERITY.ERROR,
                    "message":   "'text' is defined but never used",
                    "locations": [{ "line": 1, "column": 5 }]
                }, {
                    "linter":    "standard",
                    "rule":      "quotes",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Strings must use singlequote.",
                    "locations": [{ "line": 1, "column": 12 }]
                }
            ]);
        });
    });

    it("", function () {
        const source = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        const options = {};
        const level = SEVERITY.FATAL;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
