"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/doiuse");

const DATA_DIR = "test/data/lib/wrapper/doiuse";

describe("lib/wrapper/doiuse.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            "patterns": "*.css",
            "linters":  { "doiuse": {} }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style1.css";
        const level   = SEVERITY.INFO;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "doiuse",
                    "rule":      "border-radius",
                    "message":   "CSS3 Border-radius (rounded corners) not" +
                                 " supported by: Opera Mini (all)",
                    "locations": [{ "line": 2, "column": 1 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style2.css";
        const level   = SEVERITY.INFO;
        const options = { "browser": "ie >= 9, > 1%, last 2 versions" };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "doiuse",
                    "rule":      "background-img-opts",
                    "message":   "CSS3 Background-image options only" +
                                 " partially supported by: Safari (5.1)," +
                                 " Opera Mini (all)",
                    "locations": [{ "line": 2, "column": 1 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/style3.css";
        const level   = SEVERITY.FATAL;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
