"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/htmlhint.js");

const DATA_DIR = "../data/lib/wrapper/htmlhint";

describe("lib/wrapper/htmlhint.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/index1.html";
        const options = null;
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
                    "linter":    "htmlhint",
                    "rule":      "doctype-first",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Doctype must be declared first.",
                    "locations": [{ "line": 1, "column": 1 }]
                }
            ]);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/index3.html";
        const options = { "head-script-disabled": true };
        const level   = SEVERITY.ERROR;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/index.tex";
        const options = {};
        const level   = SEVERITY.FATAL;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
