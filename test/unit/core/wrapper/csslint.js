/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import CSSLintWrapper from "../../../../src/core/wrapper/csslint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/csslint.js", () => {
    describe("CSSLintWrapper", () => {
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

                const wrapper = new CSSLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async () => {
                const root = await tempFs.create({
                    "foo.css": `
                        button {
                            color: black;
                            color: white;
                        }
                    `,
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.css"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.css";

                const wrapper = new CSSLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "foo.css": `
                        a { }
                        #bar { width: 0px }
                    `,
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
                    files: ["foo.css"],
                };
                const options = { "empty-rules": true, ids: 2, important: 1 };
                const file = "foo.css";

                const wrapper = new CSSLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "csslint",
                        rule: "empty-rules",
                        severity: Severities.WARN,
                        message: "Rule is empty.",
                        locations: [{ line: 2, column: 25 }],
                    },
                    {
                        file,
                        linter: "csslint",
                        rule: "ids",
                        severity: Severities.ERROR,
                        message: "Don't use IDs in selectors.",
                        locations: [{ line: 3, column: 25 }],
                    },
                ]);
            });

            it("should ignore warning with ERROR level", async () => {
                const root = await tempFs.create({
                    "foo.css": `
                        a { }
                        #bar { width: 0px !important }
                    `,
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.css"],
                };
                const options = { "empty-rules": true, important: 2 };
                const file = "foo.css";

                const wrapper = new CSSLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "csslint",
                        rule: "important",
                        severity: Severities.ERROR,
                        message: "Use of !important",
                        locations: [{ line: 3, column: 32 }],
                    },
                ]);
            });
        });
    });
});
