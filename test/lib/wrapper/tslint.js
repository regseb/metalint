"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/tslint");

const DATA_DIR = "test/data/lib/wrapper/tslint";

describe("lib/wrapper/tslint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: "*.ts",
            linters:  { tslint: {} },
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: "*.ts",
            linters:  { tslint: "../tslint.json" },
        });
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script1.ts";
        const level   = SEVERITY.INFO;
        const options = {};

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script2.ts";
        const level   = SEVERITY.WARN;
        const options = {
            rules: {
                "no-consecutive-blank-lines": true,
                "no-console":                 { severity: "warning" },
            },
        };

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "tslint",
                rule:      "no-consecutive-blank-lines",
                severity:  SEVERITY.ERROR,
                message:   "Consecutive blank lines are forbidden",
                locations: [{
                    line:      3,
                    column:    1,
                    lineEnd:   4,
                    columnEnd: 1,
                }],
            }, {
                file,
                linter:    "tslint",
                rule:      "no-console",
                severity:  SEVERITY.WARN,
                message:   "Calls to 'console.log' are not allowed.",
                locations: [{
                    line:      1,
                    column:    1,
                    lineEnd:   1,
                    columnEnd: 12,
                }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script3.ts";
        const level   = SEVERITY.ERROR;
        const options = {
            rules: { "no-bitwise": { severity: "warning" } },
        };

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script4.ts";
        const level   = SEVERITY.FATAL;
        const options = {};

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
