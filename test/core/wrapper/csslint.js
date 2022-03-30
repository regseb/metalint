import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/csslint.js";

describe("src/core/wrapper/csslint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file    = "";
            const level   = SEVERITY.FATAL;
            const options = null;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({
                "foo.css": `button {
                                color: black;
                                color: white;
                            }`,
            });

            const file    = "foo.css";
            const level   = SEVERITY.INFO;
            const options = null;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({
                "foo.css": `a { }
                            #bar { width: 0px }`,
            });

            const file    = "foo.css";
            const level   = SEVERITY.WARN;
            const options = { "empty-rules": true, ids: 2, important: 1 };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "csslint",
                    rule:      "empty-rules",
                    severity:  SEVERITY.WARN,
                    message:   "Rule is empty.",
                    locations: [{ line: 1, column: 1 }],
                }, {
                    file,
                    linter:    "csslint",
                    rule:      "ids",
                    severity:  SEVERITY.ERROR,
                    message:   "Don't use IDs in selectors.",
                    locations: [{ line: 2, column: 29 }],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({
                "foo.css": `a { }
                            #bar { width: 0px }`,
            });

            const file    = "foo.css";
            const level   = SEVERITY.ERROR;
            const options = { "empty-rules": true };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });
    });
});
