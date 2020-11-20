import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/lesshint.js";

const DATA_DIR = "test/data/lib/wrapper/lesshint";

describe("lib/wrapper/lesshint.js", function () {
    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style1.less";
        const level   = SEVERITY.OFF;
        const options = null;

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style2.less";
        const level   = SEVERITY.INFO;
        const options = { urlQuotes: { severity: "error" } };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "lesshint",
                rule:      "propertyOrdering",
                severity:  SEVERITY.WARN,
                message:   `"color" should be before "width"`,
                locations: [{ line: 3, column: 5 }],
            }, {
                file,
                linter:    "lesshint",
                rule:      "urlQuotes",
                severity:  SEVERITY.ERROR,
                message:   "URLs should be enclosed in quotes.",
                locations: [{ line: 4, column: 27 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style3.less";
        const level   = SEVERITY.FATAL;
        const options = null;

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "lesshint",
                rule:      "parseError",
                severity:  SEVERITY.FATAL,
                message:   "Unclosed block",
                locations: [{ line: 1, column: 1 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style4.less";
        const level   = SEVERITY.FATAL;
        const options = null;

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
