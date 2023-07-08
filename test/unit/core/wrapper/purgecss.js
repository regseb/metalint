/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import mock from "mock-fs";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import PurgeCSSWrapper from "../../../../src/core/wrapper/purgecss.js";

describe("src/core/wrapper/purgecss.js", function () {
    describe("PurgeCSSWrapper", function () {
        describe("lint()", function () {
            it("should ignore with OFF level", async function () {
                const context = {
                    level: Levels.OFF,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.css"],
                };
                // Utiliser un tableau vide pour les fichiers HTML pour faire
                // échouer l'enrobage si le fichier est analysé.
                const options = { content: [] };
                const file = "foo.css";

                const wrapper = new PurgeCSSWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return FATAL notice", async function () {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.css"],
                };
                const options = { content: [] };
                const file = "foo.css";

                const wrapper = new PurgeCSSWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "purgecss",
                        severity: Severities.FATAL,
                        message: "No content provided.",
                    },
                ]);
            });

            it("should return notices", async function () {
                mock({
                    "foo.html": '<div class="bar"></div>',
                    "baz.css":
                        ".bar { color: blue; }\n" +
                        ".qux { color: white; }\n" +
                        ".quux .corge { color: red; }",
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.html", "baz.css"],
                };
                const options = { content: "*.html" };
                const file = "baz.css";

                const wrapper = new PurgeCSSWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "purgecss",
                        message: "'.qux' is never used.",
                    },
                    {
                        file,
                        linter: "purgecss",
                        message: "'.quux .corge' is never used.",
                    },
                ]);
            });

            it("should ignore error with FATAL level", async function () {
                mock({
                    "foo.html": "<div></div>",
                    "bar.css": ".baz { margin: 0; }",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo.html", "bar.css"],
                };
                const options = { content: "*.html" };
                const file = "bar.css";

                const wrapper = new PurgeCSSWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });
        });
    });
});
