/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import HTMLHintWrapper from "../../../../src/core/wrapper/htmlhint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/htmlhint.js", () => {
    describe("HTMLHintWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(HTMLHintWrapper.configurable);
            });
        });

        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should ignore with FATAL level", async () => {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                // Utiliser un fichier qui n'existe pas pour faire échouer
                // l'enrobage si le fichier est analysé.
                const file = "foo";

                const wrapper = new HTMLHintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async () => {
                const root = await tempFs.create({
                    "foo.html": "<html></html>",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.html"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.html";

                const wrapper = new HTMLHintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "htmlhint",
                        rule: "doctype-first",
                        severity: Severities.ERROR,
                        message: "Doctype must be declared first.",
                        locations: [{ line: 1, column: 1 }],
                    },
                ]);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "foo.html": '<img SRC="bar.svg" />',
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
                    files: ["foo.html"],
                };
                const options = { "attr-lowercase": true, "alt-require": true };
                const file = "foo.html";

                const wrapper = new HTMLHintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "htmlhint",
                        rule: "attr-lowercase",
                        severity: Severities.ERROR,
                        message:
                            "The attribute name of [ SRC ] must be in" +
                            " lowercase.",
                        locations: [{ line: 1, column: 5 }],
                    },
                    {
                        file,
                        linter: "htmlhint",
                        rule: "alt-require",
                        severity: Severities.WARN,
                        message:
                            "An alt attribute must be present on <img>" +
                            " elements.",
                        locations: [{ line: 1, column: 5 }],
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async () => {
                const root = await tempFs.create({
                    "foo.html": `
                        <head>
                          <script TYPE="text/javascript" src="bar.js"></script>
                        </head>
                    `,
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.html"],
                };
                const options = {
                    "attr-lowercase": true,
                    "head-script-disabled": true,
                };
                const file = "foo.html";

                const wrapper = new HTMLHintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "htmlhint",
                        rule: "attr-lowercase",
                        severity: Severities.ERROR,
                        message:
                            "The attribute name of [ TYPE ] must be in" +
                            " lowercase.",
                        locations: [{ line: 3, column: 34 }],
                    },
                ]);
            });
        });
    });
});
