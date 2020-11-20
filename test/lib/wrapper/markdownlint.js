import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/markdownlint.js";

const DATA_DIR = "test/data/lib/wrapper/markdownlint";

describe("lib/wrapper/markdownlint.js", function () {
    it("wrapper()", async function () {
        const file    = DATA_DIR + "/README1.md";
        const level   = SEVERITY.INFO;
        const options = null;

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "markdownlint",
                rule:      "MD029/ol-prefix",
                severity:  SEVERITY.ERROR,
                message:   "Ordered list item prefix [Expected: 2; Actual: 3;" +
                           " Style: 1/2/3]",
                locations: [{ line: 4 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/README2.md";
        const level   = SEVERITY.INFO;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/README3.md";
        const level   = SEVERITY.WARN;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "markdownlint",
                rule:      "MD026/no-trailing-punctuation",
                severity:  SEVERITY.ERROR,
                message:   "Trailing punctuation in heading [Punctuation:" +
                           " '!']",
                locations: [{ line: 1 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/README4.md";
        const level   = SEVERITY.FATAL;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
