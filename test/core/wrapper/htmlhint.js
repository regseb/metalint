/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/htmlhint.js";

describe("src/core/wrapper/htmlhint.js", function () {
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
                    linter: "htmlhint",
                    rule: "doctype-first",
                    severity: SEVERITY.ERROR,
                    message: "Doctype must be declared first.",
                    locations: [{ line: 1, column: 1 }],
                },
            ]);
        });

        it("should return notices", async function () {
            mock({ "foo.html": `<img SRC="bar.svg" />` });

            const file = "foo.html";
            const options = { "attr-lowercase": true, "alt-require": true };
            const level = SEVERITY.WARN;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "htmlhint",
                    rule: "attr-lowercase",
                    severity: SEVERITY.ERROR,
                    message:
                        "The attribute name of [ SRC ] must be in lowercase.",
                    locations: [{ line: 1, column: 5 }],
                },
                {
                    file,
                    linter: "htmlhint",
                    rule: "alt-require",
                    severity: SEVERITY.WARN,
                    message:
                        "An alt attribute must be present on <img> elements.",
                    locations: [{ line: 1, column: 5 }],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({
                "foo.html": `<head>
                               <script type="text/javascript"
                                       src="bar.js"></script>
                             </head>`,
            });

            const file = "foo.html";
            const options = { "head-script-disabled": true };
            const level = SEVERITY.ERROR;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });
    });
});
