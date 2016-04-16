/* global require, describe, it */

"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/jscs.js");

describe("lib/wrapper/jscs.js", function () {
    it("", function () {
        const source =
            "const query =\n" +
            "    \"SELECT *\\\n" +
            "      FROM DUAL\";\n";
        const options = { "disallowMultipleLineStrings": true };
        const level = SEVERITY.ERROR;

        return wrapper(source, options, level).then(function (notices) {
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
        const source = "var metalint = require(\"metalint\");";
        const options = { "disallowKeywords": ["var"] };
        const level = SEVERITY.FATAL;

        return wrapper(source, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
