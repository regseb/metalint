/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import SVGLintWrapper from "../../../../src/core/wrapper/svglint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/svglint.js", () => {
    describe("SVGLintWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(SVGLintWrapper.configurable);
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
                    files: ["foo.svg"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                // Utiliser un fichier qui n'existe pas pour faire échouer
                // l'enrobage si le fichier est analysé.
                const file = "foo.svg";

                const wrapper = new SVGLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should use default options", async () => {
                const root = await tempFs.create({ "foo.svg": "bar" });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.svg"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.svg";

                const wrapper = new SVGLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file: "foo.svg",
                        linter: "svglint",
                        rule: "valid",
                        message: "char 'b' is not expected.",
                        locations: [],
                    },
                ]);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "foo.svg": '<svg><circle cx="5" cy="5" r="2" /></svg>',
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.svg"],
                };
                const options = { rules: { elm: { circle: false } } };
                const file = "foo.svg";

                const wrapper = new SVGLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "svglint",
                        rule: "elm",
                        message: "Element disallowed at node <circle>",
                        locations: [{ line: 1, column: 6 }],
                    },
                ]);
            });
        });
    });
});
