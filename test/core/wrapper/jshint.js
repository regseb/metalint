import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/jshint.js";

describe("src/core/wrapper/jshint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file    = "";
            const level   = SEVERITY.FATAL;
            const options = null;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({ "foo.js": `eval("bar");` });

            const file    = "foo.js";
            const level   = SEVERITY.WARN;
            const options = null;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "jshint",
                    rule:      "W061",
                    severity:  SEVERITY.WARN,
                    message:   "eval can be harmful.",
                    locations: [{ line: 1, column: 1 }],
                },
            ]);
        });

        it("should return notices", async function () {
            mock({
                "foo.js": `if (1 == "1") {
                               console.log("bar");`,
            });

            const file    = "foo.js";
            const level   = SEVERITY.WARN;
            const options = { eqeqeq: true };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "jshint",
                    rule:      "W116",
                    severity:  SEVERITY.WARN,
                    message:   "Expected '===' and instead saw '=='.",
                    locations: [{ line: 1, column: 9 }],
                }, {
                    file,
                    linter:    "jshint",
                    rule:      "E019",
                    severity:  SEVERITY.ERROR,
                    message:   "Unmatched '{'.",
                    locations: [{ line: 1, column: 15 }],
                }, {
                    file,
                    linter:    "jshint",
                    rule:      "E041",
                    severity:  SEVERITY.ERROR,
                    message:   "Unrecoverable syntax error. (100% scanned).",
                    locations: [{ line: 2, column: 50 }],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({ "foo.js": "const bar = [];" });

            const file    = "foo.js";
            const level   = SEVERITY.ERROR;
            const options = { esnext: true };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });
    });
});
