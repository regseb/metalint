"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/json-lint.js");

const DATA_DIR = "../data/lib/wrapper/json-lint";

describe("lib/wrapper/json-lint.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/data1.json";
        const options = { "comment": true };
        const level   = SEVERITY.INFO;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/data2.json";
        const options = {};
        const level   = SEVERITY.WARN;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "json-lint",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Unexpected End Of Array Error. Expecting a" +
                                 " value statement.",
                    "locations": [{ "line": 1, "column": 28 }]
                }
            ]);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/data.raw";
        const options = {};
        const level   = SEVERITY.FATAL;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
