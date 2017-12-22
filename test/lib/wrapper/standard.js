"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const linter   = require("../../../lib/wrapper/standard.js");

const DATA_DIR = "../data/lib/wrapper/standard";

describe("lib/wrapper/standard.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            "patterns": "**/*.js",
            "linters":  { "standard": null }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script.js";
        const options = null;
        const level   = SEVERITY.ERROR;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "standard",
                    "rule":      "no-unused-vars",
                    "severity":  SEVERITY.ERROR,
                    "message":   "'text' is assigned a value but never" +
                                 " used.",
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

    it("wrapper()", function () {
        const file    = DATA_DIR + "/data.xml";
        const options = null;
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
