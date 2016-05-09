"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/json-lint.js");

describe("lib/wrapper/json-lint.js", function () {
    it("", function () {
        const source =
            "{\n" +
            "    // Agent 007 :\n" +
            "    \"firstName\": \"James\",\n" +
            "    \"lastName\":  \"Bond\"\n" +
            "}\n";
        const options = { "comment": true };
        const level = SEVERITY.INFO;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const source = "{ \"expected\": [2, 3, 5, 7, ] }\n";
        const options = {};
        const level = SEVERITY.WARN;

        return wrapper(source, options, level).then(function (notices) {
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
        const source = "&é\"'(-è_çà)=\n";
        const options = {};
        const level = SEVERITY.FATAL;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
