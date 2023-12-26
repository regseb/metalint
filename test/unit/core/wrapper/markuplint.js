/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import MarkuplintWrapper from "../../../../src/core/wrapper/markuplint.js";
import createTempFileSystem from "../../../utils/fake.js";

describe("src/core/wrapper/markuplint.js", function () {
    describe("MarkuplintWrapper", function () {
        describe("lint()", function () {
            it("should ignore with FATAL level", async function () {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = {};
                // Utiliser un tableau vide pour les fichiers HTML pour faire
                // échouer l'enrobage si le fichier est analysé.
                const file = "foo";

                const wrapper = new MarkuplintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async function () {
                const root = await createTempFileSystem({
                    "foo.html": "<title>Bar</title>",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.html"],
                };
                const options = {};
                const file = "foo.html";

                const wrapper = new MarkuplintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async function () {
                const root = await createTempFileSystem({
                    "foo.html": '<img src=\'bar.svg\' src="" class="BAZ" />',
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.html"],
                };
                const options = {
                    rules: {
                        "attr-duplication": true,
                        "attr-value-quotes": true,
                        "class-naming": {
                            value: "/[a-z]+/",
                            severity: "info",
                        },
                    },
                };
                const file = "foo.html";

                const wrapper = new MarkuplintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "markuplint",
                        rule: "attr-duplication",
                        severity: Severities.ERROR,
                        message: "The attribute name is duplicated",
                        locations: [{ line: 1, column: 20 }],
                    },
                    {
                        file,
                        linter: "markuplint",
                        rule: "attr-value-quotes",
                        severity: Severities.WARN,
                        message:
                            "Attribute value is must quote on double" +
                            " quotation mark",
                        locations: [{ line: 1, column: 6 }],
                    },
                    {
                        file,
                        linter: "markuplint",
                        rule: "class-naming",
                        severity: Severities.INFO,
                        message:
                            'The "BAZ" class name is unmatched with the below' +
                            ' patterns: "/[a-z]+/"',
                        locations: [{ line: 1, column: 34 }],
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async function () {
                const root = await createTempFileSystem({
                    "foo.html": '<input required="required" required />',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.html"],
                };
                const options = {
                    rules: {
                        "attr-duplication": true,
                        "no-boolean-attr-value": true,
                    },
                };
                const file = "foo.html";

                const wrapper = new MarkuplintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "markuplint",
                        rule: "attr-duplication",
                        severity: Severities.ERROR,
                        message: "The attribute name is duplicated",
                        locations: [{ line: 1, column: 28 }],
                    },
                ]);
            });
        });
    });
});
