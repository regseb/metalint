"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/standard");

const DATA_DIR = "test/data/lib/wrapper/standard";

describe("lib/wrapper/standard.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            patterns: "*.js",
            linters:  { standard: null },
        });
    });

    it("wrapper()", function () {
        const file  = DATA_DIR + "/script.js";
        const level = SEVERITY.ERROR;

        return linter.wrapper(file, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    file:      file,
                    linter:    "standard",
                    rule:      "no-unused-vars",
                    message:   "'text' is assigned a value but never used.",
                    locations: [{ line: 1, column: 5 }],
                }, {
                    file:      file,
                    linter:    "standard",
                    rule:      "quotes",
                    message:   "Strings must use singlequote.",
                    locations: [{ line: 1, column: 12 }],
                },
            ]);
        });
    });

    it("wrapper()", function () {
        const file  = DATA_DIR + "/data.xml";
        const level = SEVERITY.FATAL;

        return linter.wrapper(file, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
