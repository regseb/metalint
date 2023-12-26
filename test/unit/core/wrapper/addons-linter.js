/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import sinon from "sinon";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import AddonsLinterWrapper from "../../../../src/core/wrapper/addons-linter.js";
import createTempFileSystem from "../../../utils/fake.js";

describe("src/core/wrapper/addons-linter.js", function () {
    describe("AddonsLinterWrapper", function () {
        describe("lint()", function () {
            it("should ignore with FATAL level", async function () {
                const spy = sinon.spy(console, "log");

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

                assert.equal(spy.callCount, 0);
            });

            it("should return notice from zip", async function () {
                const root = await createTempFileSystem({
                    "addon.xpi": {
                        "manifest.json": JSON.stringify({
                            // eslint-disable-next-line camelcase
                            browser_specific_settings: {
                                gecko: {
                                    id: "addon@metalint",
                                    // eslint-disable-next-line camelcase
                                    strict_min_version: "56.0",
                                },
                            },
                            // eslint-disable-next-line camelcase
                            manifest_version: 1,
                            name: "addon",
                            version: "1.0.0",
                            // eslint-disable-next-line camelcase
                            optional_permissions: ["find"],
                        }),
                    },
                });
                const spy = sinon.spy(console, "log");

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
                    files: ["addon.xpi"],
                };
                const options = {};
                const file = "addon.xpi";

                const wrapper = new AddonsLinterWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "addons-linter",
                        rule: "JSON_INVALID",
                        severity: Severities.ERROR,
                        message: '"/manifest_version" must be >= 2',
                    },
                    {
                        file: file + "/manifest.json",
                        linter: "addons-linter",
                        rule: "PERMISSION_FIREFOX_UNSUPPORTED_BY_MIN_VERSION",
                        severity: Severities.INFO,
                        message:
                            "Permission not supported by the specified" +
                            " minimum Firefox version",
                    },
                ]);

                assert.equal(spy.callCount, 0);
            });

            it("should return notices found in file", async function () {
                const root = await createTempFileSystem({
                    "foo/manifest.json": JSON.stringify({
                        // eslint-disable-next-line camelcase
                        browser_specific_settings: {
                            gecko: { id: "bar@baz.com" },
                        },
                        // eslint-disable-next-line camelcase
                        manifest_version: 2,
                        version: "1.0.0",
                        permissions: ["god mode"],
                    }),
                });
                const spy = sinon.spy(console, "log");

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
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

                assert.equal(spy.callCount, 0);
            });

            it("should accept options", async function () {
                const root = await createTempFileSystem({
                    "foo/manifest.json": JSON.stringify({
                        // eslint-disable-next-line camelcase
                        manifest_version: 1,
                        version: "2.3.4",
                        name: "bar",
                    }),
                });
                const spy = sinon.spy(console, "log");

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
                    files: ["foo/"],
                };
                const options = { minManifestVersion: 1 };
                const file = "foo/";

                const wrapper = new AddonsLinterWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);

                assert.equal(spy.callCount, 0);
            });

            it("should return notices on directory", async function () {
                const root = await createTempFileSystem({ "foo/bar.txt": "" });
                const spy = sinon.spy(console, "log");

                const context = {
                    level: Levels.INFO,
                    fix: false,
                    root,
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

                assert.equal(spy.callCount, 0);
            });

            it("should ignore warning with ERROR level", async function () {
                const root = await createTempFileSystem({
                    foo: {
                        "manifest.json": JSON.stringify({
                            // eslint-disable-next-line camelcase
                            manifest_version: 2,
                            name: "bar",
                            version: "1.0.0+beta",
                        }),
                        "index.js": 'document.write("baz");',
                    },
                });
                const spy = sinon.spy(console, "log");

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
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
                        rule: "VERSION_FORMAT_INVALID",
                        severity: Severities.ERROR,
                        message: "The version string should be simplified.",
                    },
                ]);

                assert.equal(spy.callCount, 0);
            });

            it("should support null file in result", async function () {
                const root = await createTempFileSystem({
                    "foo/manifest.json": "{ name: 'foo' }",
                });
                const spy = sinon.spy(console, "log");

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo/"],
                };
                const options = {};
                const file = "foo/";

                const wrapper = new AddonsLinterWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "addons-linter",
                        rule: "JSON_INVALID",
                        severity: Severities.ERROR,
                        message: "Your JSON is not valid.",
                    },
                    {
                        file: file + "manifest.json",
                        linter: "addons-linter",
                        rule: "JSON_INVALID",
                        severity: Severities.ERROR,
                        message: "Your JSON is not valid.",
                    },
                ]);

                assert.equal(spy.callCount, 0);
            });
        });
    });
});
