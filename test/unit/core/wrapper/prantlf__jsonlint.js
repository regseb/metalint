/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import PrantlfJSONLintWrapper from "../../../../src/core/wrapper/prantlf__jsonlint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/prantlf__jsonlint.js", () => {
    describe("PrantlfJSONLintWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(PrantlfJSONLintWrapper.configurable);
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

                const wrapper = new PrantlfJSONLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notice", async () => {
                const root = await tempFs.create({ "foo.json": '{ "bar":' });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.json";

                const wrapper = new PrantlfJSONLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "prantlf__jsonlint",
                        message: "Unexpected end",
                        locations: [{ line: 1, column: 9 }],
                    },
                ]);
            });

            it("shouldn't return notice", async () => {
                const root = await tempFs.create({
                    "foo.json": '{ "bar": "baz" }',
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.json";

                const wrapper = new PrantlfJSONLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should take options", async () => {
                const root = await tempFs.create({
                    "foo.json": '{ "bar": "baz", "bar": "qux" }',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = { allowDuplicateObjectKeys: false };
                const file = "foo.json";

                const wrapper = new PrantlfJSONLintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "prantlf__jsonlint",
                        message: 'Duplicate key: "bar"',
                        locations: [{ line: 1, column: 22 }],
                    },
                ]);
            });
        });
    });
});
