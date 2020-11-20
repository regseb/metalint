import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/purgecss.js";

const DATA_DIR = "test/data/lib/wrapper/purgecss";

describe("lib/wrapper/purgecss.js", function () {
    it("wrapper()", async function () {
        const cwd = process.cwd();

        const file    = "style.css";
        const level   = SEVERITY.INFO;
        const options = {
            content: "*.html",
        };

        process.chdir(DATA_DIR);
        const notices = await wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "purgecss",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "'.blue' is never used.",
                locations: [],
            }, {
                file,
                linter:    "purgecss",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "'.red .green' is never used.",
                locations: [],
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
            safelist: ["blue"],
        };

        process.chdir(DATA_DIR);
        const notices = await wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "purgecss",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "'.red .green' is never used.",
                locations: [],
            },
        ]);

        process.chdir(cwd);
    });

    it("wrapper()", async function () {
        const cwd = process.cwd();

        const file    = "style.css";
        const level   = SEVERITY.INFO;
        const options = {
            content:  ["*.html", "*.js"],
            safelist: [/^b.*$/u],
        };

        process.chdir(DATA_DIR);
        const notices = await wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "purgecss",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "'.red .green' is never used.",
                locations: [],
            },
        ]);

        process.chdir(cwd);
    });

    it("wrapper()", async function () {
        const cwd = process.cwd();

        const file    = "style.css";
        const level   = SEVERITY.INFO;
        const options = {
            content:  ["*.html", "*.js"],
            safelist: { deep: [/^r/u] },
        };

        process.chdir(DATA_DIR);
        const notices = await wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "purgecss",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "'.blue' is never used.",
                locations: [],
            },
        ]);

        process.chdir(cwd);
    });

    it("wrapper()", async function () {
        const file    = "style.css";
        const level   = SEVERITY.FATAL;
        const options = { content: [] };

        const notices = await wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "purgecss",
                rule:      null,
                severity:  SEVERITY.FATAL,
                message:   "No content provided.",
                locations: [],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = "style.css";
        const level   = SEVERITY.OFF;
        const options = null;

        const notices = await wrapper(file, level, options, DATA_DIR);
        assert.deepStrictEqual(notices, []);
    });
});
