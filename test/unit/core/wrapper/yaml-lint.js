/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import mock from "mock-fs";
import Levels from "../../../../src/core/levels.js";
import YAMLLintWrapper from "../../../../src/core/wrapper/yaml-lint.js";

describe("src/core/wrapper/yaml-lint.js", function () {
    describe("YAMLLintWrapper", function () {
        describe("lint()", function () {
            it("should ignore with FATAL level", async function () {
                mock({ "foo.yaml": ":" });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.yaml"],
                };
                const options = {};
                const file = "foo.yaml";

                const wrapper = new YAMLLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async function () {
                mock({ "foo.yaml": "bar" });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.yaml"],
                };
                const options = {};
                const file = "foo.yaml";

                const wrapper = new YAMLLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async function () {
                mock({ "foo.yml": ": bar" });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.yml"],
                };
                const options = { schema: "FAILSAFE_SCHEMA" };
                const file = "foo.yml";

                const wrapper = new YAMLLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "yaml-lint",
                        message:
                            "incomplete explicit mapping pair; a key node is" +
                            " missed; or followed by a non-tabulated empty" +
                            " line",
                        locations: [{ line: 1, column: 1 }],
                    },
                ]);
            });
        });
    });
});
