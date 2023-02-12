/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/markdownlint.js";

describe("src/core/wrapper/markdownlint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file = "";
            const options = undefined;
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.md": "# bar\n\n1. baz\n3. qux\n",
            });

            const file = "foo.md";
            const options = undefined;
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "markdownlint",
                    rule: "MD029/ol-prefix",
                    severity: SEVERITY.ERROR,
                    message:
                        "Ordered list item prefix [Expected: 2; Actual: 3;" +
                        " Style: 1/2/3]",
                    locations: [{ line: 4 }],
                },
            ]);
        });

        it("shouldn't return notice", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.md": "# bar\n\nbaz\n",
            });

            const file = "foo.md";
            const options = undefined;
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.md": "# bar!\n",
            });

            const file = "foo.md";
            const options = undefined;
            const level = SEVERITY.WARN;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "markdownlint",
                    rule: "MD026/no-trailing-punctuation",
                    severity: SEVERITY.ERROR,
                    message:
                        "Trailing punctuation in heading [Punctuation: '!']",
                    locations: [{ line: 1 }],
                },
            ]);
        });
    });
});
