"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/standard.js");

const DATA_DIR = "../data/lib/wrapper/standard";

describe("lib/wrapper/standard.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/script.js";
        const options = {};
        const level   = SEVERITY.ERROR;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "standard",
                    "rule":      "no-unused-vars",
                    "severity":  SEVERITY.ERROR,
                    "message":   "'text' is defined but never used.",
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
        const file    = DATA_DIR + "/data.xml";
        const options = {};
        const level   = SEVERITY.FATAL;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
