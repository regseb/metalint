/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import MarkdownlintWrapper from "../../../../src/core/wrapper/markdownlint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/markdownlint.js", () => {
    describe("MarkdownlintWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(MarkdownlintWrapper.configurable);
            });
        });

        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should ignore with FATAL level and no fix", async () => {
                const root = await tempFs.create({ "foo.md": "Bar" });

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

            it("should use default options", async () => {
                const root = await tempFs.create({
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

            it("shouldn't return notice", async () => {
                const root = await tempFs.create({
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

            it("should return notices", async () => {
                const root = await tempFs.create({ "foo.md": "Bar\n" });

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
                            ' heading [Context: "Bar"]',
                        locations: [{ line: 1 }],
                    },
                ]);
            });

            it("should fix", async () => {
                const root = await tempFs.create({
                    "foo.md": "# Bar\n# Baz\n*  Qux\n",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: true,
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
                        rule: "MD025/single-title/single-h1",
                        message:
                            "Multiple top-level headings in the same document" +
                            ' [Context: "Baz"]',
                        locations: [{ line: 2 }],
                    },
                ]);

                const content = await fs.readFile("foo.md", "utf8");
                assert.equal(content, "# Bar\n\n# Baz\n\n* Qux\n");
            });

            it("should fix with FATAL level", async () => {
                const root = await tempFs.create({
                    "foo.md": "#  Bar  #",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: true,
                    root,
                    files: ["foo.md"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.md";

                const wrapper = new MarkdownlintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("foo.md", "utf8");
                assert.equal(content, "# Bar #\n");
            });
        });
    });
});
