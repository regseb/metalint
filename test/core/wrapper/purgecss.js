/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/purgecss.js";

describe("src/core/wrapper/purgecss.js", function () {
    describe("wrapper()", function () {
        it("should ignore with OFF level", async function () {
            const file = "";
            const options = undefined;
            const level = SEVERITY.OFF;

            const notices = await wrapper(file, options, {
                level,
                root: process.cwd(),
            });
            assert.deepEqual(notices, []);
        });

        it("should return FATAL notice", async function () {
            const file = "foo.css";
            const options = { content: [] };
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, options, {
                level,
                root: process.cwd(),
            });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "purgecss",
                    severity: SEVERITY.FATAL,
                    message: "No content provided.",
                    locations: [],
                },
            ]);
        });

        it("should return notices", async function () {
            mock({
                "foo.html": `<div class="bar"></div>`,
                "baz.css":
                    ".bar { color: blue; }\n" +
                    ".qux { color: white; }\n" +
                    ".quux .corge { color: red; }",
            });

            const file = "baz.css";
            const options = { content: "*.html" };
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, options, {
                level,
                root: process.cwd(),
            });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "purgecss",
                    severity: SEVERITY.ERROR,
                    message: "'.qux' is never used.",
                    locations: [],
                },
                {
                    file,
                    linter: "purgecss",
                    severity: SEVERITY.ERROR,
                    message: "'.quux .corge' is never used.",
                    locations: [],
                },
            ]);
        });

        it("should ignore error with FATAL level", async function () {
            mock({
                "foo.html": `<div></div>`,
                "bar.css": ".baz { margin: 0; }",
            });

            const file = "bar.css";
            const options = { content: "*.html" };
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, options, {
                level,
                root: process.cwd(),
            });
            assert.deepEqual(notices, []);
        });
    });
});
