/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import StylelintWrapper from "../../../../src/core/wrapper/stylelint.js";
import createTempFileSystem from "../../../utils/fake.js";

describe("src/core/wrapper/stylelint.js", function () {
    describe("StylelintWrapper", function () {
        describe("lint()", function () {
            it("should fix", async function () {
                const root = await createTempFileSystem({
                    "foo.css": "header { top: 0px; }",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: true,
                    root,
                    files: ["foo.css"],
                };
                const options = { rules: { "length-zero-no-unit": true } };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                const content = await fs.readFile("foo.css", "utf8");
                assert.equal(content, "header { top: 0; }");
            });

            it("should ignore with FATAL level and no fix", async function () {
                const root = await createTempFileSystem({
                    "foo.css": "a { animation: 80ms; }",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["foo.css"],
                };
                const options = {
                    "time-min-milliseconds": 100,
                };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async function () {
                const root = await createTempFileSystem({
                    "foo.css": "div {}",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.css"],
                };
                const options = { rules: {} };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("shouldn't return notice", async function () {
                const root = await createTempFileSystem({
                    "foo.css": "a { color: #FFFFFF; }",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.css"],
                };
                const options = { rules: { "block-no-empty": true } };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async function () {
                const root = await createTempFileSystem({
                    "foo.css": "p { color: #y3 }\np { }",
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
                    files: ["foo.css"],
                };
                const options = {
                    rules: {
                        "color-no-invalid-hex": [true, { severity: "warning" }],
                        "no-duplicate-selectors": true,
                    },
                };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "stylelint",
                        rule: "color-no-invalid-hex",
                        severity: Severities.WARN,
                        message: 'Unexpected invalid hex color "#y3"',
                        locations: [{ line: 1, column: 12 }],
                    },
                    {
                        file,
                        linter: "stylelint",
                        rule: "no-duplicate-selectors",
                        severity: Severities.ERROR,
                        message:
                            'Unexpected duplicate selector "p", first used at' +
                            " line 1",
                        locations: [{ line: 2, column: 1 }],
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async function () {
                const root = await createTempFileSystem({
                    "foo.css": "span { color: #bar; top: 0px; }",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.css"],
                };
                const options = {
                    rules: {
                        "color-no-invalid-hex": true,
                        "length-zero-no-unit": [true, { severity: "warning" }],
                    },
                };
                const file = "foo.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "stylelint",
                        rule: "color-no-invalid-hex",
                        severity: Severities.ERROR,
                        message: 'Unexpected invalid hex color "#bar"',
                        locations: [{ line: 1, column: 15 }],
                    },
                ]);
            });

            it("should lint all files (cf. disableDefaultIgnores)", async function () {
                const root = await createTempFileSystem({
                    "foo/node_modules/bar.css": "main { width: 100baz; }",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo/node_modules/bar.css"],
                };
                const options = { rules: { "unit-no-unknown": true } };
                const file = "foo/node_modules/bar.css";

                const wrapper = new StylelintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "stylelint",
                        rule: "unit-no-unknown",
                        severity: Severities.ERROR,
                        message: 'Unexpected unknown unit "baz"',
                        locations: [{ line: 1, column: 18 }],
                    },
                ]);
            });
        });
    });
});
