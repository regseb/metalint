"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/htmlhint");

const DATA_DIR = "test/data/lib/wrapper/htmlhint";

describe("lib/wrapper/htmlhint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: "*.html",
            linters:  { htmlhint: null },
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: "*.html",
            linters:  { htmlhint: "../.htmlhintrc" },
        });
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index1.html";
        const level   = SEVERITY.INFO;
        const options = null;

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index2.html";
        const level   = SEVERITY.WARN;
        const options = {};

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "htmlhint",
                rule:      "doctype-first",
                severity:  SEVERITY.ERROR,
                message:   "Doctype must be declared first.",
                locations: [{ line: 1, column: 1 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index3.html";
        const level   = SEVERITY.ERROR;
        const options = { "head-script-disabled": true };

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index.tex";
        const level   = SEVERITY.FATAL;
        const options = {};

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
