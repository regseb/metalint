/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import mock from "mock-fs";
import Levels from "../../../../src/core/levels.js";
import HtmllintWrapper from "../../../../src/core/wrapper/htmllint.js";

describe("src/core/wrapper/htmllint.js", function () {
    describe("HtmllintWrapper", function () {
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

                const wrapper = new HtmllintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async function () {
                mock({ "foo.html": "<html></html>" });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.html"],
                };
                const options = {};
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

            it("should return notices", async function () {
                mock({ "foo.html": '<img SRC="bar.svg" />\n' });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.html"],
                };
                const options = {};
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