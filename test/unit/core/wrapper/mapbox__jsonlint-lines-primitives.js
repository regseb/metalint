/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import MapboxJSONLintLinesPrimitivesWrapper from "../../../../src/core/wrapper/mapbox__jsonlint-lines-primitives.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/mapbox__jsonlint-lines-primitives.js", () => {
    describe("MapboxJSONintLinesPrimitivesWrapper", () => {
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

                const wrapper = new MapboxJSONLintLinesPrimitivesWrapper(
                    context,
                    options,
                );
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notice", async () => {
                const root = await tempFs.create({
                    "foo.json": '{ "bar": 42\n"baz": 420 }',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.json";

                const wrapper = new MapboxJSONLintLinesPrimitivesWrapper(
                    context,
                    options,
                );
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "mapbox__jsonlint-lines-primitives",
                        message: "Expecting 'EOF', '}', ',', ']', got 'STRING'",
                        locations: [{ line: 1 }],
                    },
                ]);
            });

            it("shouldn't return notice", async () => {
                const root = await tempFs.create({
                    "foo.json": '{ "bar": 42 }',
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo.json";

                const wrapper = new MapboxJSONLintLinesPrimitivesWrapper(
                    context,
                    options,
                );
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });
        });
    });
});