/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import process from "node:process";
import Levels from "../../../../src/core/levels.js";
import Severities from "../../../../src/core/severities.js";
import AjvWrapper from "../../../../src/core/wrapper/ajv.js";
import createTempFileSystem from "../../../utils/fake.js";

/**
 * @typedef {import("ajv").default} Ajv
 */

describe("src/core/wrapper/ajv.js", function () {
    describe("AjvWrapper", function () {
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

                const wrapper = new AjvWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return empty when no problem", async function () {
                const root = await createTempFileSystem({
                    "foo.json": '{ "bar": "baz" }',
                });

                const context = {
                    level: Levels.WARN,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = {
                    schema: {
                        type: "object",
                        properties: { bar: { type: "string" } },
                    },
                };
                const file = "foo.json";

                const wrapper = new AjvWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should return notices", async function () {
                const root = await createTempFileSystem({
                    "foo.json": '{ "bar": "baz" }',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = {
                    schema: {
                        type: "object",
                        properties: { bar: { type: "integer" } },
                    },
                };
                const file = "foo.json";

                const wrapper = new AjvWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "ajv",
                        rule: "type",
                        severity: Severities.ERROR,
                        message: "/bar must be integer",
                    },
                ]);
            });

            it("should support addFormats()", async function () {
                const root = await createTempFileSystem({
                    "foo.json": '{ "bar": "baz" }',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = {
                    schema: {
                        type: "object",
                        properties: {
                            bar: { type: "string", format: "yes-no" },
                        },
                    },
                    addFormats(/** @type {Ajv} */ ajv) {
                        ajv.addFormat("yes-no", /^(?:no|yes)$/u);
                    },
                };
                const file = "foo.json";

                const wrapper = new AjvWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "ajv",
                        rule: "format",
                        severity: Severities.ERROR,
                        message: '/bar must match format "yes-no"',
                    },
                ]);
            });

            it("should ignore error with FATAL level", async function () {
                const root = await createTempFileSystem({
                    "foo.json": '{ "bar": "baz" }',
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = {
                    schema: {
                        type: "object",
                        properties: { bar: { type: "integer" } },
                    },
                };
                const file = "foo.json";

                const wrapper = new AjvWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, []);
            });

            it("should reject when no loadSchema()", async function () {
                const root = await createTempFileSystem({
                    "foo.json": '{ "bar": "baz" }',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = {
                    schema: {
                        type: "object",
                        properties: { bar: { $ref: "qux" } },
                    },
                };
                const file = "foo.json";

                const wrapper = new AjvWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "ajv",
                        severity: Severities.FATAL,
                        message: "loadSchema() must be implemented to load qux",
                    },
                ]);
            });

            it("should support loadSchema()", async function () {
                const root = await createTempFileSystem({
                    "foo.json": '{ "bar": "baz" }',
                });

                const context = {
                    level: Levels.ERROR,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = {
                    loadSchema(/** @type {string} */ _uri) {
                        return { type: "integer" };
                    },
                    schema: {
                        type: "object",
                        properties: { bar: { $ref: "qux" } },
                    },
                };
                const file = "foo.json";

                const wrapper = new AjvWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "ajv",
                        severity: Severities.ERROR,
                        rule: "type",
                        message: "/bar must be integer",
                    },
                ]);
            });

            it("should return FATAL notice", async function () {
                const root = await createTempFileSystem({
                    "foo.json": "bar: baz",
                });

                const context = {
                    level: Levels.FATAL,
                    fix: false,
                    root,
                    files: ["foo.json"],
                };
                const options = {
                    schema: {
                        type: "object",
                        properties: { bar: { type: "integer" } },
                    },
                };
                const file = "foo.json";

                const wrapper = new AjvWrapper(context, options);
                const notices = await wrapper.lint(file);
                assert.deepEqual(notices, [
                    {
                        file,
                        linter: "ajv",
                        severity: Severities.FATAL,
                        message:
                            "Unexpected token 'b', \"bar: baz\" is not valid" +
                            " JSON",
                    },
                ]);
            });
        });
    });
});
