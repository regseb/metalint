"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/jsonlint");

const DATA_DIR = "test/data/lib/wrapper/jsonlint";

describe("lib/wrapper/jsonlint.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            patterns: "*.json",
            linters:  { jsonlint: null },
        });
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/data1.json";
        const level = SEVERITY.INFO;

        const notices = await linter.wrapper(file, level);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "jsonlint",
                message:   "Expecting 'EOF', '}', ',', ']', got 'STRING'",
                locations: [{ line: 3 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/data2.json";
        const level = SEVERITY.INFO;

        const notices = await linter.wrapper(file, level);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/data3.json";
        const level = SEVERITY.WARN;

        const notices = await linter.wrapper(file, level);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "jsonlint",
                message:   "Expecting 'STRING', 'NUMBER', 'NULL', 'TRUE'," +
                           " 'FALSE', '{', '[', got 'undefined'",
                locations: [{ line: 2 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/test.txt";
        const level = SEVERITY.FATAL;

        const notices = await linter.wrapper(file, level);
        assert.deepStrictEqual(notices, []);
    });
});
