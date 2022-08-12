import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/jsonlint.js";

describe("src/core/wrapper/jsonlint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file  = "";
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, level);
            assert.deepStrictEqual(notices, []);
        });

        it("should return notice", async function () {
            mock({ "foo.json": `{ "bar": "baz }` });

            const file  = "foo.json";
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, level);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "jsonlint",
                    severity:  SEVERITY.ERROR,
                    message:   "Expecting 'STRING', 'NUMBER', 'NULL', 'TRUE'," +
                               " 'FALSE', '{', '[', got 'undefined'",
                    locations: [{ line: 2 }],
                },
            ]);
        });
    });
});
