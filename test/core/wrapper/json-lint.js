import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/json-lint.js";

describe("src/core/wrapper/json-lint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file    = "";
            const level   = SEVERITY.FATAL;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({ "foo.json": "{ bar: 0 }" });

            const file    = "foo.json";
            const level   = SEVERITY.INFO;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "json-lint",
                    severity:  SEVERITY.ERROR,
                    message:   "Unknown Character 'b', expecting a string for" +
                               " key statement.",
                    locations: [{ line: 1, column: 3 }],
                },
            ]);
        });

        it("should return notice", async function () {
            mock({ "foo.json": `{ "bar": [0, 1, ] }` });

            const file    = "foo.json";
            const level   = SEVERITY.WARN;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "json-lint",
                    severity:  SEVERITY.ERROR,
                    message:   "Unexpected End Of Array Error. Expecting a" +
                               " value statement.",
                    locations: [{ line: 1, column: 17 }],
                },
            ]);
        });
    });
});
