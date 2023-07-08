/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import mock from "mock-fs";
import Levels from "../../../../src/core/levels.js";
import JSONLintModWrapper from "../../../../src/core/wrapper/jsonlint-mod.js";

describe("src/core/wrapper/jsonlint-mod.js", function () {
    describe("JSONLintModWrapper", function () {
        describe("lint()", function () {
            it("should ignore with FATAL level", async function () {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = {};
                // Utiliser un fichier qui n'existe pas pour faire échouer
                // l'enrobage si le fichier est analysé.
                const file = "foo";

                const wrapper = new JSONLintModWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notice", async function () {
                mock({ "foo.json": '{ "bar": 42\n"baz": 420 }' });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.json"],
                };
                const options = {};
                const file = "foo.json";

                const wrapper = new JSONLintModWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "jsonlint-mod",
                        message: "Expecting 'EOF', '}', ',', ']', got 'STRING'",
                        locations: [{ line: 1 }],
                    },
                ]);
            });

            it("shouldn't return notice", async function () {
                mock({ "foo.json": '{ "bar": 42 }' });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.json"],
                };
                const options = {};
                const file = "foo.json";

                const wrapper = new JSONLintModWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });
        });
    });
});
