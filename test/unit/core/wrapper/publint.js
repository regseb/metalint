/**
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import { afterEach, describe, it } from "node:test";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import PublintWrapper from "../../../../src/core/wrapper/publint.js";
import tempFs from "../../../utils/temp-fs.js";

describe("src/core/wrapper/publint.js", () => {
    describe("PublintWrapper", () => {
        describe("configurable", () => {
            it("should be true", () => {
                assert.ok(PublintWrapper.configurable);
            });
        });

        describe("lint()", () => {
            afterEach(async () => {
                await tempFs.reset();
            });

            it("should ignore with OFF level", async () => {
                const context = {
                    level: Levels.OFF,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                // Utiliser un fichier qui n'existe pas pour faire échouer
                // l'enrobage si le fichier est analysé.
                const file = "foo";

                const wrapper = new PublintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it('should reject file not ending "package.json"', async () => {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["package.jsonc"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.jsonc";

                const wrapper = new PublintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        severity: Severities.FATAL,
                        linter: "publint",
                        message: 'package.jsonc must end with "package.json".',
                    },
                ]);
            });

            it("should return notices", async () => {
                const root = await tempFs.create({
                    "foo.js": 'console.log("bar");',
                    "package.json": JSON.stringify({
                        name: "baz",
                        version: "1.0.0",
                        exports: { "./qux.js": "./qux.js" },
                        jsnext: "foo.js",
                    }),
                });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new PublintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        severity: Severities.INFO,
                        linter: "publint",
                        rule: "USE_TYPE",
                        message:
                            'The package does not specify the "type" field.' +
                            " Node.js may attempt to detect the package type" +
                            " causing a small performance hit. Consider" +
                            ' adding "type": "commonjs".',
                    },
                    {
                        file,
                        severity: Severities.ERROR,
                        linter: "publint",
                        rule: "FILE_DOES_NOT_EXIST",
                        message:
                            'pkg.exports["./qux.js"] is ./qux.js but the file' +
                            " does not exist.",
                    },
                    {
                        file,
                        severity: Severities.WARN,
                        linter: "publint",
                        rule: "DEPRECATED_FIELD_JSNEXT",
                        message:
                            "pkg.jsnext is deprecated. pkg.module should be" +
                            " used instead.",
                    },
                ]);
            });

            it("should support options", async () => {
                const root = await tempFs.create({
                    "foo.js": "",
                    "package.json": JSON.stringify({
                        name: "bar",
                        version: "1.0.0",
                        jsnext: "foo.js",
                    }),
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({
                    strict: true,
                });
                const file = "package.json";

                const wrapper = new PublintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        severity: Severities.ERROR,
                        linter: "publint",
                        rule: "DEPRECATED_FIELD_JSNEXT",
                        message:
                            "pkg.jsnext is deprecated. pkg.module should be" +
                            " used instead.",
                    },
                ]);
            });

            it("should ignore error with FATAL level", async () => {
                const root = await tempFs.create({
                    "package.json": JSON.stringify({
                        name: "foo",
                        version: "1.0.0",
                        dependencies: { bar: "2.0.0" },
                    }),
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "package.json";

                const wrapper = new PublintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return FATAL notice", async () => {
                const root = await tempFs.create({
                    "foo/package.json": "<version>1.0.0</version>",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["foo/package.json"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo/package.json";

                const wrapper = new PublintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.equal(notices.length, 1);
                assert.equal(notices[0].file, file);
                assert.equal(notices[0].linter, "publint");
                assert.equal(notices[0].severity, Severities.FATAL);
                assert.ok(
                    notices[0].message.startsWith(
                        "Command failed: npm pack --pack-destination ",
                    ),
                    `"${notices[0].message}".startsWith("...")`,
                );
            });
        });
    });
});
