/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import HtmllintWrapper from "../../../../src/core/wrapper/htmllint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/htmllint.js", () => {
    describe("HtmllintWrapper", () => {
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

                const wrapper = new HtmllintWrapper(context, options);
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

                const wrapper = new HtmllintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "htmllint",
                        rule: "line-end-style",
                        message: "E015",
                        locations: [{ line: 1, column: 13 }],
                    },
                ]);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "foo.html": '<img SRC="bar.svg" />\n',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.html"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.html";

                const wrapper = new HtmllintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "htmllint",
                        rule: "attr-name-style",
                        message: "E002",
                        locations: [{ line: 1, column: 6 }],
                    },
                    {
                        file,
                        linter: "htmllint",
                        rule: "img-req-alt",
                        message: "E013",
                        locations: [{ line: 1, column: 1 }],
                    },
                ]);
            });
        });
    });
});
