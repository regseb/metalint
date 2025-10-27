/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import MarkuplintWrapper from "../../../../src/core/wrapper/markuplint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/markuplint.js", () => {
    describe("MarkuplintWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(MarkuplintWrapper.configurable);
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
                // Utiliser un tableau vide pour les fichiers HTML pour faire
                // échouer l'enrobage si le fichier est analysé.
                const file = "foo";

                const wrapper = new MarkuplintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should reject directory", async () => {
                const root = await tempFs.create({ foo: {} });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo";

                const wrapper = new MarkuplintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "markuplint",
                        message: "markuplint returns null result",
                        severity: Severities.FATAL,
                    },
                ]);
            });

            it("should use default options", async () => {
                const root = await tempFs.create({
                    "foo.html": "<title>Bar</title>",
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.html"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.html";

                const wrapper = new MarkuplintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "foo.html": `<img src='bar.svg' src="" class="BAZ" />`,
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

            it("should ignore warning with ERROR level", async () => {
                const root = await tempFs.create({
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
