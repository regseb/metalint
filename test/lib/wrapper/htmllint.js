"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/htmllint.js");

const DATA_DIR = "../data/lib/wrapper/htmllint";

describe("lib/wrapper/htmllint.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/index1.html";
        const options = {};
        const level   = SEVERITY.INFO;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/index2.html";
        const options = {};
        const level   = SEVERITY.WARN;

        return wrapper(file, options, level).then(function (notices) {
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
        const file    = DATA_DIR + "/index3.html";
        const options = {};
        const level   = SEVERITY.FATAL;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
