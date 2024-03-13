/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import PublintWrapper from "../../../../src/core/wrapper/publint.js";
import createTempFileSystem from "../../../utils/fake.js";

describe("src/core/wrapper/publint.js", function () {
    describe("PublintWrapper", function () {
        describe("lint()", function () {
            it("should ignore with OFF level", async function () {
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

            it('should reject file not ending "package.json"', async function () {
                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = /** @type {Record<string, unknown>} */ ({});
                const file = "foo";

                const wrapper = new PublintWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        severity: Severities.FATAL,
                        linter: "publint",
                        message: 'foo must end with "package.json".',
                    },
                ]);
            });

            it("should return notices", async function () {
                const root = await createTempFileSystem({
                    "foo.js": 'console.log("bar");',
                    "package.json": JSON.stringify({
                        exports: { "./bar.js": "./bar.js" },
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
                            "The package does not specify the type field." +
                            " Environments may incorrectly identify a CJS" +
                            " file as ESM in the future. Consider adding" +
                            ' "type": "commonjs".',
                    },
                    {
                        file,
                        severity: Severities.ERROR,
                        linter: "publint",
                        rule: "FILE_DOES_NOT_EXIST",
                        message:
                            'pkg.exports["./bar.js"] is ./bar.js but the file' +
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

            it("should ignore error with FATAL level", async function () {
                const root = await createTempFileSystem({
                    "package.json": JSON.stringify({
                        dependencies: { foo: "1.0.0" },
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

            it("should return FATAL notice", async function () {
                const root = await createTempFileSystem({
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
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "publint",
                        severity: Severities.FATAL,
                        message:
                            "Unexpected token '<', \"<version>1\"... is not" +
                            " valid JSON",
                    },
                ]);
            });
        });
    });
});
