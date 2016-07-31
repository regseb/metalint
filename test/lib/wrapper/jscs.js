"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/jscs.js");

const DATA_DIR = "../data/lib/wrapper/jscs";

describe("lib/wrapper/jscs.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/script1.js";
        const options = { "disallowMultipleLineStrings": true };
        const level   = SEVERITY.ERROR;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jscs",
                    "rule":      "disallowMultipleLineStrings",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Multiline strings are disallowed.",
                    "locations": [{ "line": 2, "column": 4 }]
                }
            ]);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/script2.js";
        const options = { "disallowKeywords": ["var"] };
        const level   = SEVERITY.FATAL;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/README.md";
        const options = { "disallowSemicolons": true };
        const level   = SEVERITY.INFO;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "jscs",
                    "rule":      "parseError",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Unterminated string constant (1:1)",
                    "locations": [{ "line": 1, "column": 1 }]
                }
            ]);
        });
    });
});
