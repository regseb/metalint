"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/htmllint");

const DATA_DIR = "test/data/lib/wrapper/htmllint";

describe("lib/wrapper/htmllint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: "*.html",
            linters:  { htmllint: null },
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: "*.html",
            linters:  { htmllint: "../.htmllintrc" },
        });
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index1.html";
        const level   = SEVERITY.INFO;
        const options = null;

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "htmllint",
                rule:      "attr-name-style",
                message:   "E002",
                locations: [{ line: 2, column: 8 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index2.html";
        const level   = SEVERITY.INFO;
        const options = {};

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index3.html";
        const level   = SEVERITY.WARN;
        const options = {};

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "htmllint",
                rule:      "attr-quote-style",
                message:   "E005",
                locations: [{ line: 1, column: 13 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index4.html";
        const level   = SEVERITY.FATAL;
        const options = {};

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
