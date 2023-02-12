/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/stylelint.js";

describe("src/core/wrapper/stylelint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file = "";
            const options = undefined;
            const level = SEVERITY.FATAL;
            const fix = false;

            const notices = await wrapper(file, options, { level, fix });
            assert.deepEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.css": "div {}",
            });

            const file = "foo.css";
            const options = undefined;
            const level = SEVERITY.INFO;
            const fix = false;

            const notices = await wrapper(file, options, { level, fix });
            assert.deepEqual(notices, []);
        });

        it("shouldn't return notice", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.css": "a { color: #FFFFFF; }",
            });

            const file = "foo.css";
            const options = { rules: { "color-hex-case": "upper" } };
            const level = SEVERITY.INFO;
            const fix = false;

            const notices = await wrapper(file, options, { level, fix });
            assert.deepEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.css":
                    "p { font-size: .5em }\n" +
                    "label::after { content: 'bar'; }",
            });

            const file = "foo.css";
            const options = {
                rules: {
                    "number-leading-zero": ["always", { severity: "warning" }],
                    "string-quotes": "double",
                },
            };
            const level = SEVERITY.WARN;
            const fix = false;

            const notices = await wrapper(file, options, { level, fix });
            assert.deepEqual(notices, [
                {
                    file,
                    linter: "stylelint",
                    rule: "number-leading-zero",
                    severity: SEVERITY.WARN,
                    message: "Expected a leading zero",
                    locations: [{ line: 1, column: 16 }],
                },
                {
                    file,
                    linter: "stylelint",
                    rule: "string-quotes",
                    severity: SEVERITY.ERROR,
                    message: "Expected double quotes",
                    locations: [{ line: 2, column: 25 }],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.css": "span {\n    font-style: italic;\n}",
            });

            const file = "foo.css";
            const options = {
                rules: { indentation: [2, { severity: "warning" }] },
            };
            const level = SEVERITY.ERROR;
            const fix = false;

            const notices = await wrapper(file, options, { level, fix });
            assert.deepEqual(notices, []);
        });
    });
});
