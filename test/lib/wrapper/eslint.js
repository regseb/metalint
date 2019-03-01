"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/eslint");

const DATA_DIR = "test/data/lib/wrapper/eslint";

describe("lib/wrapper/eslint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "*.js",
            "linters":  { "eslint": null }
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            "patterns": "*.js",
            "linters":  { "eslint": "../.eslintrc" }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script1.js";
        const level   = SEVERITY.INFO;
        const options = null;

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script2.js";
        const level   = SEVERITY.WARN;
        const options = {
            "rules": {
                "indent":            [1, 4, { "SwitchCase": 1 }],
                "no-duplicate-case": 2
            }
        };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "eslint",
                    "rule":      "indent",
                    "severity":  SEVERITY.WARN,
                    "message":   "Expected indentation of 4 spaces but found" +
                                 " 3.",
                    "locations": [{ "line": 4, "column": 1 }]
                }, {
                    "file":      file,
                    "linter":    "eslint",
                    "rule":      "no-duplicate-case",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Duplicate case label.",
                    "locations": [{ "line": 5, "column": 5 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script3.js";
        const level   = SEVERITY.ERROR;
        const options = { "rules": { "no-bitwise": 1 } };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script4.js";
        const level   = SEVERITY.INFO;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "eslint",
                    "rule":      null,
                    "severity":  SEVERITY.FATAL,
                    "message":   "Parsing error: Unexpected token ;",
                    "locations": [{ "line": 1, "column": 9 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/index.js";
        const level   = SEVERITY.INFO;
        const options = {
            "plugins": ["filenames", "jsdoc", "mocha"],
            "rules":   {
                "filenames/no-index":          2,
                "jsdoc/check-types":           2,
                "jsdoc/check-syntax":           2,
                "mocha/prefer-arrow-callback": 2
            }
        };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "eslint",
                    "rule":      "filenames/no-index",
                    "severity":  SEVERITY.ERROR,
                    "message":   "'index.js' files are not allowed.",
                    "locations": [{ "line": 3, "column": 1 }]
                }, {
                    "file":      file,
                    "linter":    "eslint",
                    "rule":      "mocha/prefer-arrow-callback",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Unexpected function expression.",
                    "locations": [{ "line": 3, "column": 5 }]
                }, {
                    "file":      file,
                    "linter":    "eslint",
                    "rule":      "jsdoc/check-types",
                    "severity":  SEVERITY.ERROR,
                    "message":   `Invalid JSDoc @returns type "Object";` +
                                 ` prefer: "object".`,
                    "locations": [{ "line": 8 }]
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/script5.js";
        const level   = SEVERITY.OFF;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
