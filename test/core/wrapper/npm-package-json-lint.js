/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/npm-package-json-lint.js";

describe("src/core/wrapper/npm-package-json-lint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file = "";
            const options = {};
            const level = SEVERITY.FATAL;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "package.json": `{ "name": "FOO" }`,
            });

            const file = "package.json";
            const options = {
                rules: {
                    "require-version": "warning",
                    "name-format": "error",
                },
            };
            const level = SEVERITY.WARN;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "npm-package-json-lint",
                    rule: "require-version",
                    severity: SEVERITY.WARN,
                    message: "version is required",
                    locations: [],
                },
                {
                    file,
                    linter: "npm-package-json-lint",
                    rule: "name-format",
                    severity: SEVERITY.ERROR,
                    message: "name can no longer contain capital letters",
                    locations: [],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "package.json": `{}`,
            });

            const file = "package.json";
            const options = { rules: { "require-description": "warning" } };
            const level = SEVERITY.ERROR;

            const notices = await wrapper(file, options, { level });
            assert.deepEqual(notices, []);
        });
    });
});
