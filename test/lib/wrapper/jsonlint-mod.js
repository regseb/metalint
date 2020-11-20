import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/jsonlint-mod.js";

const DATA_DIR = "test/data/lib/wrapper/jsonlint-mod";

describe("lib/wrapper/jsonlint-mod.js", function () {
    it("wrapper()", async function () {
        const file  = DATA_DIR + "/data1.json";
        const level = SEVERITY.INFO;

        const notices = await wrapper(file, level);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "jsonlint-mod",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "Expecting 'EOF', '}', ',', ']', got 'STRING'",
                locations: [{ line: 3 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/data2.json";
        const level = SEVERITY.INFO;

        const notices = await wrapper(file, level);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/data3.json";
        const level = SEVERITY.WARN;

        const notices = await wrapper(file, level);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "jsonlint-mod",
                rule:      null,
                severity:  SEVERITY.ERROR,
                message:   "Expecting 'STRING', 'NUMBER', 'NULL', 'TRUE'," +
                           " 'FALSE', '{', '[', got 'undefined'",
                locations: [{ line: 2 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/test.txt";
        const level = SEVERITY.FATAL;

        const notices = await wrapper(file, level);
        assert.deepStrictEqual(notices, []);
    });
});
