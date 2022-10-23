import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/addons-linter.js";

describe("src/core/wrapper/addons-linter.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file    = "";
            const level   = SEVERITY.FATAL;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("shouldn't return notice from zip", async function () {
            // Ne pas utiliser mock-fs car il y un bogue avec yaulz (la
            // bibliothèque utilisée par addons-linter pour lire les zip).
            // https://github.com/tschaub/mock-fs/issues/352
            const file    = "test/data/addon.xpi";
            const level   = SEVERITY.INFO;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
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
                        manifest_version:          2,
                        version:                   "1.0.0",
                        permissions:               ["god mode"],
                    }),
                },
            });

            const file    = "foo/";
            const level   = SEVERITY.WARN;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file:      file + "manifest.json",
                    linter:    "addons-linter",
                    rule:      "MANIFEST_FIELD_REQUIRED",
                    severity:  SEVERITY.ERROR,
                    message:   `"/" must have required property 'name'`,
                    locations: [],
                }, {
                    file:      file + "manifest.json",
                    linter:    "addons-linter",
                    rule:      "MANIFEST_PERMISSIONS",
                    severity:  SEVERITY.WARN,
                    message:   `/permissions: Invalid permissions "god mode"` +
                               ` at 0.`,
                    locations: [],
                },
            ]);
        });

        it("should accept options", async function () {
            mock({
                foo: {
                    "manifest.json": JSON.stringify({
                        // eslint-disable-next-line camelcase
                        manifest_version: 3,
                        version:          "4.2.1",
                        name:             "bar",
                    }),
                },
            });

            const file    = "foo/";
            const level   = SEVERITY.WARN;
            const options = { maxManifestVersion: 3 };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file:      file + "manifest.json",
                    linter:    "addons-linter",
                    rule:      "EXTENSION_ID_REQUIRED",
                    severity:  SEVERITY.ERROR,
                    message:   "The extension ID is required in Manifest" +
                               " Version 3 and above.",
                    locations: [],
                },
            ]);
        });

        it("should return notices", async function () {
            mock({ foo: { "bar.txt": "" } });

            const file    = "foo";
            const level   = SEVERITY.INFO;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "addons-linter",
                    rule:      "TYPE_NO_MANIFEST_JSON",
                    severity:  SEVERITY.ERROR,
                    message:   "manifest.json was not found",
                    locations: [],
                },
            ]);
        });
    });
});
