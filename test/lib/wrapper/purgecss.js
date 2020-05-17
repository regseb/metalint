"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/purgecss");

const DATA_DIR = "test/data/lib/wrapper/purgecss";

describe("lib/wrapper/purgecss.js", function () {
    it("configure()", function () {
        const checker = linter.configure();

        assert.deepStrictEqual(checker, {
            patterns: "*.css",
            linters:  { purgecss: { content: ["*.html", "*.js"] } },
        });
    });

    it("wrapper()", async function () {
        const cwd = process.cwd();

        const file    = "style.css";
        const level   = SEVERITY.INFO;
        const options = {
            content: "*.html",
        };

        process.chdir(DATA_DIR);
        const notices = await linter.wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:   "purgecss",
                severity: SEVERITY.ERROR,
                message:  "'.blue' is never used.",
            }, {
                file,
                linter:   "purgecss",
                severity: SEVERITY.ERROR,
                message:  "'.red .green' is never used.",
            },
        ]);

        process.chdir(cwd);
    });

    it("wrapper()", async function () {
        const cwd = process.cwd();

        const file    = "style.css";
        const level   = SEVERITY.INFO;
        const options = {
            content:   ["*.html", "*.js"],
            whitelist: ["blue"],
        };

        process.chdir(DATA_DIR);
        const notices = await linter.wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:   "purgecss",
                severity: SEVERITY.ERROR,
                message:  "'.red .green' is never used.",
            },
        ]);

        process.chdir(cwd);
    });

    it("wrapper()", async function () {
        const cwd = process.cwd();

        const file    = "style.css";
        const level   = SEVERITY.INFO;
        const options = {
            content:           ["*.html", "*.js"],
            whitelistPatterns: ["/^b.*$/u"],
        };

        process.chdir(DATA_DIR);
        const notices = await linter.wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:   "purgecss",
                severity: SEVERITY.ERROR,
                message:  "'.red .green' is never used.",
            },
        ]);

        process.chdir(cwd);
    });

    it("wrapper()", async function () {
        const cwd = process.cwd();

        const file    = "style.css";
        const level   = SEVERITY.INFO;
        const options = {
            content:                   ["*.html", "*.js"],
            whitelistPatternsChildren: ["/^r/u"],
        };

        process.chdir(DATA_DIR);
        const notices = await linter.wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:   "purgecss",
                severity: SEVERITY.ERROR,
                message:  "'.blue' is never used.",
            },
        ]);

        process.chdir(cwd);
    });

    it("wrapper()", async function () {
        const file    = "style.css";
        const level   = SEVERITY.FATAL;
        const options = { content: [] };

        const notices = await linter.wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:   "purgecss",
                severity: SEVERITY.FATAL,
                message:  "No content provided.",
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = "style.css";
        const level   = SEVERITY.OFF;
        const options = null;

        const notices = await linter.wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, []);
    });
});
