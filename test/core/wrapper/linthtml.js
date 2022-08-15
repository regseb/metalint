import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/linthtml.js";

describe("src/core/wrapper/linthtml.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file    = "";
            const level   = SEVERITY.FATAL;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({ "foo.html": "<html></html>" });

            const file    = "foo.html";
            const level   = SEVERITY.INFO;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({ "foo.html": `<img SRC="bar.svg" />\n` });

            const file    = "foo.html";
            const level   = SEVERITY.INFO;
            const options = {
                rules: {
                    "attr-name-style": "error",
                    "img-req-alt":     ["warning", true],
                },
            };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "linthtml",
                    rule:      "attr-name-style",
                    severity:  SEVERITY.ERROR,
                    message:   "E002",
                    locations: [{
                        line:      1,
                        column:    6,
                        lineEnd:   1,
                        columnEnd: 9,
                    }],
                }, {
                    file,
                    linter:    "linthtml",
                    rule:      "img-req-alt",
                    severity:  SEVERITY.WARN,
                    message:   "E013",
                    locations: [{
                        line:      1,
                        column:    1,
                        lineEnd:   1,
                        columnEnd: 22,
                    }],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({ "foo.html": `<p class="BAR BAZ BAZ"></p>\n` });

            const file    = "foo.html";
            const level   = SEVERITY.ERROR;
            const options = {
                rules: {
                    "class-no-dup": true,
                    "class-style":  ["warning", "lowercase"],
                },
            };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "linthtml",
                    rule:      "class-no-dup",
                    severity:  SEVERITY.ERROR,
                    message:   "E041",
                    locations: [{
                        line:      1,
                        column:    10,
                        lineEnd:   1,
                        columnEnd: 23,
                    }],
                },
            ]);
        });
    });
});
