/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/htmllint.js";

describe("src/core/wrapper/htmllint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file = "";
            const options = undefined;
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({ "foo.html": "<html></html>" });

            const file = "foo.html";
            const options = undefined;
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "htmllint",
                    rule: "line-end-style",
                    message: "E015",
                    locations: [{ line: 1, column: 13 }],
                },
            ]);
        });

        it("should return notices", async function () {
            mock({ "foo.html": `<img SRC="bar.svg" />\n` });

            const file = "foo.html";
            const options = undefined;
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "htmllint",
                    rule: "attr-name-style",
                    message: "E002",
                    locations: [{ line: 1, column: 6 }],
                },
                {
                    file,
                    linter: "htmllint",
                    rule: "img-req-alt",
                    message: "E013",
                    locations: [{ line: 1, column: 1 }],
                },
            ]);
        });
    });
});
