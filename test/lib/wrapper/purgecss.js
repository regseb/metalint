"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/purgecss");

const DATA_DIR = "test/data/lib/wrapper/purgecss";

describe("lib/wrapper/purgecss.js", function () {
    it("configure()", function () {
        const checker = linter.configure();

        assert.deepStrictEqual(checker, {
            "patterns": "*.css",
            "linters":  { "purgecss": { "content": ["*.html", "*.js"] } }
        });
    });

    it("wrapper()", function () {
        const cwd = process.cwd();

        const file    = "style.css";
        const level   = SEVERITY.INFO;
        const options = {
            "content": "*.html"
        };

        process.chdir(DATA_DIR);
        return linter.wrapper(file, level, options, DATA_DIR)
                     .then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":     file,
                    "linter":   "purgecss",
                    "severity": SEVERITY.ERROR,
                    "message":  "'.blue' is never used."
                }, {
                    "file":     file,
                    "linter":   "purgecss",
                    "severity": SEVERITY.ERROR,
                    "message":  "'.red' is never used."
                }
            ]);

            process.chdir(cwd);
        });
    });

    it("wrapper()", function () {
        const cwd = process.cwd();

        const file    = "style.css";
        const level   = SEVERITY.INFO;
        const options = {
            "content":   ["*.html", "*.js"],
            "whitelist": ["red"]
        };

        process.chdir(DATA_DIR);
        return linter.wrapper(file, level, options, DATA_DIR)
                     .then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":     file,
                    "linter":   "purgecss",
                    "severity": SEVERITY.ERROR,
                    "message":  "'.blue' is never used."
                }
            ]);

            process.chdir(cwd);
        });
    });

    it("wrapper()", function () {
        const file    = "style.css";
        const level   = SEVERITY.FATAL;
        const options = { "content": [] };

        return linter.wrapper(file, level, options, DATA_DIR)
                     .then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":     file,
                    "linter":   "purgecss",
                    "severity": SEVERITY.FATAL,
                    "message":  "No content provided."
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = "style.css";
        const level   = SEVERITY.OFF;
        const options = null;

        return linter.wrapper(file, level, options, DATA_DIR)
                     .then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
