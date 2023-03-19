/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import AddonsLinterWrapper from "../../../../src/core/wrapper/addons-linter.js";

describe("src/core/wrapper/addons-linter.js", function () {
    describe("AddonsLinterWrapper", function () {
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

                const wrapper = new AddonsLinterWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("shouldn't return notice from zip", async function () {
                // Ne pas utiliser mock-fs car il y un bogue avec yaulz (la
                // bibliothèque utilisée par addons-linter pour lire les zip).
                // https://github.com/tschaub/mock-fs/issues/352
                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["test/data/addon.xpi"],
                };
                const options = {};
                const file = "test/data/addon.xpi";

                const wrapper = new AddonsLinterWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices found in file", async function () {
                mock({
                    foo: {
                        "manifest.json": JSON.stringify({
                            // eslint-disable-next-line camelcase
                            browser_specific_settings: {
                                gecko: { id: "bar@baz.com" },
                            },
                            // eslint-disable-next-line camelcase
                            manifest_version: 2,
                            version: "1.0.0",
                            permissions: ["god mode"],
                        }),
                    },
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo/"],
                };
                const options = {};
                const file = "foo/";

                const wrapper = new AddonsLinterWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file: file + "manifest.json",
                        linter: "addons-linter",
                        rule: "MANIFEST_FIELD_REQUIRED",
                        severity: Severities.ERROR,
                        message: "\"/\" must have required property 'name'",
                    },
                    {
                        file: file + "manifest.json",
                        linter: "addons-linter",
                        rule: "MANIFEST_PERMISSIONS",
                        severity: Severities.WARN,
                        message:
                            '/permissions: Invalid permissions "god mode" at' +
                            " 0.",
                    },
                ]);
            });

            it("should accept options", async function () {
                mock({
                    foo: {
                        "manifest.json": JSON.stringify({
                            // eslint-disable-next-line camelcase
                            manifest_version: 3,
                            version: "4.2.1",
                            name: "bar",
                        }),
                    },
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo/"],
                };
                const options = { maxManifestVersion: 3 };
                const file = "foo/";

                const wrapper = new AddonsLinterWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file: file + "manifest.json",
                        linter: "addons-linter",
                        rule: "EXTENSION_ID_REQUIRED",
                        severity: Severities.ERROR,
                        message:
                            "The extension ID is required in Manifest Version" +
                            " 3 and above.",
                    },
                ]);
            });

            it("should return notices on directory", async function () {
                mock({ foo: { "bar.txt": "" } });

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root: process.cwd(),
                    files: ["foo"],
                };
                const options = {};
                const file = "foo";

                const wrapper = new AddonsLinterWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "addons-linter",
                        rule: "TYPE_NO_MANIFEST_JSON",
                        severity: Severities.ERROR,
                        message: "manifest.json was not found",
                    },
                ]);
            });
        });
    });
});
