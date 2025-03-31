/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import YAMLLintWrapper from "../../../../src/core/wrapper/yaml-lint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/yaml-lint.js", () => {
    describe("YAMLLintWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(YAMLLintWrapper.configurable);
            });
        });

        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should ignore with FATAL level", async () => {
                const root = await tempFs.create({ "foo.yaml": ":" });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["foo.yaml"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.yaml";

                const wrapper = new YAMLLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async () => {
                const root = await tempFs.create({ "foo.yaml": "bar" });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.yaml"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.yaml";

                const wrapper = new YAMLLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({ "foo.yml": ": bar" });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
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
