/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import Levels from "../../../../src/core/levels.js";
import MarkdownlintWrapper from "../../../../src/core/wrapper/markdownlint.js";
import createTempFileSystem from "../../../utils/fake.js";

describe("src/core/wrapper/markdownlint.js", function () {
    describe("MarkdownlintWrapper", function () {
        describe("lint()", function () {
            it("should ignore with FATAL level", async function () {
                const root = await createTempFileSystem({
                    "foo.md": "Bar",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["foo.md"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.md";

                const wrapper = new MarkdownlintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async function () {
                const root = await createTempFileSystem({
                    "foo.md": "# bar\n\n1. baz\n3. qux\n",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.md"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.md";

                const wrapper = new MarkdownlintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "markdownlint",
                        rule: "MD029/ol-prefix",
                        message:
                            "Ordered list item prefix [Expected: 2; Actual:" +
                            " 3; Style: 1/2/3]",
                        locations: [{ line: 4 }],
                    },
                ]);
            });

            it("shouldn't return notice", async function () {
                const root = await createTempFileSystem({
                    "foo.md": "# bar\n\nbaz\n",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.md"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.md";

                const wrapper = new MarkdownlintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async function () {
                const root = await createTempFileSystem({
                    "foo.md": "Bar!\n",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.md"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.md";

                const wrapper = new MarkdownlintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "markdownlint",
                        rule: "MD041/first-line-heading/first-line-h1",
                        message:
                            "First line in a file should be a top-level" +
                            ' heading [Context: "Bar!"]',
                        locations: [{ line: 1 }],
                    },
                ]);
            });
        });
    });
});
