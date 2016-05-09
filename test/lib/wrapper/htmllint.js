"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/htmllint.js");

describe("lib/wrapper/htmllint.js", function () {
    it("", function () {
        const source =
            "<!DOCTYPE html>\n" +
            "<title>Exemple</title>\n";
        const options = {};
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source = "<input type='hidden' name=\"id\" />\n";
        const options = {};
        const level = SEVERITY.WARN;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "htmllint",
                    "rule":      "attr-quote-style",
                    "severity":  SEVERITY.ERROR,
                    "message":   "E005",
                    "locations": [{ "line": 1, "column": 13 }]
                }
            ]);
        });
    });

    it("", function () {
        const source = "<img src=\"logo.svg\" />\n";
        const options = {};
        const level = SEVERITY.FATAL;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
