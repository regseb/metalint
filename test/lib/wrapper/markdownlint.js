"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/markdownlint.js");

const DATA_DIR = "../data/lib/wrapper/markdownlint";

describe("lib/wrapper/markdownlint.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/README1.md";
        const options = {};
        const level   = SEVERITY.INFO;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/README2.md";
        const options = {};
        const level   = SEVERITY.WARN;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "markdownlint",
                    "rule":      "MD026",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Trailing punctuation in header",
                    "locations": [{ "line": 1 }]
                }
            ]);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/README3.md";
        const options = {};
        const level   = SEVERITY.FATAL;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
