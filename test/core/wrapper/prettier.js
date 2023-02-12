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
        it("should ignore with FATAL level", async function () {
            const file = "";
            const level = SEVERITY.FATAL;
            const options = undefined;

            const notices = await wrapper(file, level, options);
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
            const level = SEVERITY.INFO;
            const options = undefined;

            const notices = await wrapper(file, level, options);
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
            const level = SEVERITY.INFO;
            const options = { semi: false };

            const notices = await wrapper(file, level, options);
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
    });
});
