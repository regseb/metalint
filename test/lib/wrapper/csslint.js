"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/csslint");

const DATA_DIR = "test/data/lib/wrapper/csslint";

describe("lib/wrapper/csslint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: "*.css",
            linters:  { csslint: null },
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: "*.css",
            linters:  { csslint: "../.csslintrc" },
        });
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style1.css";
        const level   = SEVERITY.FATAL;
        const options = null;

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style2.css";
        const level   = SEVERITY.INFO;
        const options = { floats: true };

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style3.css";
        const level   = SEVERITY.WARN;
        const options = { "empty-rules": true };

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "csslint",
                rule:      "empty-rules",
                severity:  SEVERITY.WARN,
                message:   "Rule is empty.",
                locations: [{ line: 1, column: 1 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style4.css";
        const level   = SEVERITY.ERROR;
        const options = { ids: 2, important: 1 };

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "csslint",
                rule:      "ids",
                severity:  SEVERITY.ERROR,
                message:   "Don't use IDs in selectors.",
                locations: [{ line: 1, column: 1 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style4.css";
        const level   = SEVERITY.FATAL;
        const options = { "zero-units": 2 };

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
