"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const linter   = require("../../../lib/wrapper/doiuse.js");

const DATA_DIR = "../data/lib/wrapper/doiuse";

describe("lib/wrapper/doiuse.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            "patterns": "**/*.css",
            "linters":  { "doiuse": {} }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style1.css";
        const options = {};
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "doiuse",
                    "rule":      "border-radius",
                    "severity":  SEVERITY.ERROR,
                    "message":   "CSS3 Border-radius (rounded corners) not" +
                                 " supported by: Opera Mini (all)",
                    "locations": [{ "line": 2, "column": 1 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style2.css";
        const options = { "browser": "ie >= 9, > 1%, last 2 versions" };
        const level   = SEVERITY.INFO;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "doiuse",
                    "rule":      "background-img-opts",
                    "severity":  SEVERITY.ERROR,
                    "message":   "CSS3 Background-image options only" +
                                 " partially supported by: Opera Mini (all)",
                    "locations": [{ "line": 2, "column": 1 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style3.css";
        const options = {};
        const level   = SEVERITY.FATAL;

        return linter.wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
