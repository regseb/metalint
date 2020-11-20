import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/eslint.js";

const DATA_DIR = "test/data/lib/wrapper/eslint";

describe("lib/wrapper/eslint.js", function () {
    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script1.js";
        const level   = SEVERITY.INFO;
        const options = null;

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script2.js";
        const level   = SEVERITY.WARN;
        const options = {
            rules: {
                indent:              [1, 4, { SwitchCase: 1 }],
                "no-duplicate-case": 2,
            },
        };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "eslint",
                rule:      "indent",
                severity:  SEVERITY.WARN,
                message:   "Expected indentation of 4 spaces but found 3.",
                locations: [{ line: 4, column: 1 }],
            }, {
                file,
                linter:    "eslint",
                rule:      "no-duplicate-case",
                severity:  SEVERITY.ERROR,
                message:   "Duplicate case label.",
                locations: [{ line: 5, column: 5 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script3.js";
        const level   = SEVERITY.ERROR;
        const options = { rules: { "no-bitwise": 1 } };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script4.js";
        const level   = SEVERITY.INFO;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "eslint",
                rule:      null,
                severity:  SEVERITY.FATAL,
                message:   "Parsing error: Unexpected token ;",
                locations: [{ line: 1, column: 9 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index.js";
        const level   = SEVERITY.INFO;
        const options = {
            plugins: ["filenames", "jsdoc", "mocha"],
            rules:   {
                "filenames/no-index":          2,
                "jsdoc/check-types":           2,
                "jsdoc/check-syntax":          2,
                "mocha/prefer-arrow-callback": 2,
            },
        };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "eslint",
                rule:      "filenames/no-index",
                severity:  SEVERITY.ERROR,
                message:   "'index.js' files are not allowed.",
                locations: [{ line: 3, column: 1 }],
            }, {
                file,
                linter:    "eslint",
                rule:      "mocha/prefer-arrow-callback",
                severity:  SEVERITY.ERROR,
                message:   "Unexpected function expression.",
                locations: [{ line: 3, column: 5 }],
            }, {
                file,
                linter:    "eslint",
                rule:      "jsdoc/check-types",
                severity:  SEVERITY.ERROR,
                message:   `Invalid JSDoc @returns type "Object"; prefer:` +
                           ` "object".`,
                locations: [{ line: 8 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script5.js";
        const level   = SEVERITY.OFF;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
