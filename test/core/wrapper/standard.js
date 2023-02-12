/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/standard.js";

describe("src/core/wrapper/standard.js", function () {
    describe("wrapper()", function () {
        it("should ignore with OFF level", async function () {
            const file = "";
            const level = SEVERITY.OFF;

            const notices = await wrapper(file, level);
            assert.deepEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.js": `var bar = 'baz'\n`,
            });

            const file = "foo.js";
            const level = SEVERITY.WARN;

            const notices = await wrapper(file, level);
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "standard",
                    severity: SEVERITY.WARN,
                    rule: "no-var",
                    message: "Unexpected var, use let or const instead.",
                    locations: [
                        {
                            line: 1,
                            column: 1,
                            endLine: 1,
                            endColumn: 16,
                        },
                    ],
                },
                {
                    file,
                    linter: "standard",
                    severity: SEVERITY.ERROR,
                    rule: "no-unused-vars",
                    message: "'bar' is assigned a value but never used.",
                    locations: [
                        {
                            line: 1,
                            column: 5,
                            endLine: 1,
                            endColumn: 8,
                        },
                    ],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.js": "var bar = 0\nconsole.log(bar)\n",
            });

            const file = "foo.js";
            const level = SEVERITY.ERROR;

            const notices = await wrapper(file, level);
            assert.deepEqual(notices, []);
        });

        it("should return FATAL notice", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.js": "const bar = ;\n",
            });

            const file = "foo.js";
            const level = SEVERITY.INFO;

            const notices = await wrapper(file, level);
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "standard",
                    severity: SEVERITY.FATAL,
                    message: "Parsing error: Unexpected token ;",
                    locations: [{ line: 1, column: 13 }],
                },
            ]);
        });
    });
});
