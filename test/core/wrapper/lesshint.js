/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/lesshint.js";

describe("src/core/wrapper/lesshint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with OFF level", async function () {
            const file = "";
            const options = undefined;
            const level = SEVERITY.OFF;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.less": "a {}",
            });

            const file = "foo.less";
            const options = undefined;
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "lesshint",
                    rule: "emptyRule",
                    severity: SEVERITY.WARN,
                    message: "There shouldn't be any empty rules present.",
                    locations: [{ line: 1, column: 1 }],
                },
                {
                    file,
                    linter: "lesshint",
                    rule: "finalNewline",
                    severity: SEVERITY.WARN,
                    message: "Files should end with a newline.",
                    locations: [{ line: 1, column: 5 }],
                },
            ]);
        });

        it("should return notices", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.less":
                    "div {\n" +
                    "    width: 100px;\n" +
                    "    color: black;\n" +
                    "    background-image: url(bar.png);\n" +
                    "}\n",
            });

            const file = "foo.less";
            const options = { urlQuotes: { severity: "error" } };
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "lesshint",
                    rule: "propertyOrdering",
                    severity: SEVERITY.WARN,
                    message: `"color" should be before "width"`,
                    locations: [{ line: 3, column: 5 }],
                },
                {
                    file,
                    linter: "lesshint",
                    rule: "urlQuotes",
                    severity: SEVERITY.ERROR,
                    message: "URLs should be enclosed in quotes.",
                    locations: [{ line: 4, column: 27 }],
                },
            ]);
        });

        it("should return fatal notice", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.less": "span {",
            });

            const file = "foo.less";
            const options = undefined;
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "lesshint",
                    rule: "parseError",
                    severity: SEVERITY.FATAL,
                    message: "Unclosed block",
                    locations: [{ line: 1, column: 1 }],
                },
            ]);
        });
    });
});
