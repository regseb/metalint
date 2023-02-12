/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/prettier.js";

describe("src/core/wrapper/prettier.js", function () {
    describe("wrapper()", function () {
        it("should ignore with OFF level", async function () {
            const file = "";
            const options = undefined;
            const level = SEVERITY.OFF;
            const fix = false;

            const notices = await wrapper(file, options, { level, fix });
            assert.deepEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.html": "<div>bar</div>\n",
            });

            const file = "foo.html";
            const options = undefined;
            const level = SEVERITY.INFO;
            const fix = false;

            const notices = await wrapper(file, options, { level, fix });
            assert.deepEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.js": "const bar = 42;\n",
            });

            const file = "foo.js";
            const options = { semi: false };
            const level = SEVERITY.INFO;
            const fix = false;

            const notices = await wrapper(file, options, { level, fix });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "prettier",
                    severity: SEVERITY.ERROR,
                    message: "Code style issues found.",
                    locations: [],
                },
            ]);
        });

        it("should return FATAL notice", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.js": `const bar = { "baz;\n`,
            });

            const file = "foo.js";
            const options = { semi: false };
            const level = SEVERITY.WARN;
            const fix = false;

            const notices = await wrapper(file, options, { level, fix });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "prettier",
                    severity: SEVERITY.FATAL,
                    message: "SyntaxError: Unterminated string constant.",
                    locations: [{ line: 1, column: 15 }],
                },
            ]);
        });
    });
});
