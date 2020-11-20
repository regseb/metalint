import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/stylelint.js";

const DATA_DIR = "test/data/lib/wrapper/stylelint";

describe("lib/wrapper/stylelint.js", function () {
    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style1.css";
        const level   = SEVERITY.INFO;
        const options = null;

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style2.css";
        const level   = SEVERITY.INFO;
        const options = { rules: { "color-hex-case": "upper" } };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style3.css";
        const level   = SEVERITY.WARN;
        const options = {
            rules: {
                "number-leading-zero": ["always", { severity: "warning" }],
            },
        };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "stylelint",
                rule:      "number-leading-zero",
                severity:  SEVERITY.WARN,
                message:   "Expected a leading zero",
                locations: [{ line: 1, column: 16 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style4.css";
        const level   = SEVERITY.ERROR;
        const options = {
            rules: {
                "string-quotes": "double",
                indentation:     [2, { severity: "warning" }],
            },
        };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "stylelint",
                rule:      "string-quotes",
                severity:  SEVERITY.ERROR,
                message:   "Expected double quotes",
                locations: [{ line: 2, column: 14 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style5.css";
        const level   = SEVERITY.FATAL;
        const options = { rules: { "no-extra-semicolons": true } };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/node_modules/style.css";
        const level   = SEVERITY.INFO;
        const options = { rules: { "unit-no-unknown": true } };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "stylelint",
                rule:      "unit-no-unknown",
                severity:  SEVERITY.ERROR,
                message:   `Unexpected unknown unit "el"`,
                locations: [{ line: 2, column: 12 }],
            },
        ]);
    });
});
