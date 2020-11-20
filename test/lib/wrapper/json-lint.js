import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/json-lint.js";

const DATA_DIR = "test/data/lib/wrapper/json-lint";

describe("lib/wrapper/json-lint.js", function () {
    it("wrapper()", async function () {
        const file    = DATA_DIR + "/data1.json";
        const level   = SEVERITY.INFO;
        const options = null;

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "json-lint",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "Unknown Character 'k', expecting a string for key" +
                           " statement.",
                locations: [{ line: 2, column: 5 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/data2.json";
        const level   = SEVERITY.INFO;
        const options = { comment: true };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/data3.json";
        const level   = SEVERITY.WARN;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "json-lint",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "Unexpected End Of Array Error. Expecting a value" +
                           " statement.",
                locations: [{ line: 1, column: 28 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/data.raw";
        const level   = SEVERITY.FATAL;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
