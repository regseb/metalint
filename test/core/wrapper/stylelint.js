import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/stylelint.js";

describe("src/core/wrapper/stylelint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file    = "";
            const level   = SEVERITY.FATAL;
            const options = null;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                // eslint-disable-next-line camelcase
                node_modules: {
                    stylelint:              mock.load("node_modules" +
                                                      "/stylelint/"),
                    "postcss-value-parser": mock.load("node_modules" +
                                                      "/postcss-value-parser/"),
                    "style-search":         mock.load("node_modules" +
                                                      "/style-search/"),
                },
                "foo.css": "div {}",
            });

            const file    = "foo.css";
            const level   = SEVERITY.INFO;
            const options = null;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("shouldn't return notice", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                // eslint-disable-next-line camelcase
                node_modules: {
                    stylelint:              mock.load("node_modules" +
                                                      "/stylelint/"),
                    "postcss-value-parser": mock.load("node_modules" +
                                                      "/postcss-value-parser/"),
                    "style-search":         mock.load("node_modules" +
                                                      "/style-search/"),
                },
                "foo.css":    "a { color: #FFFFFF; }",
            });

            const file    = "foo.css";
            const level   = SEVERITY.INFO;
            const options = { rules: { "color-hex-case": "upper" } };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                // eslint-disable-next-line camelcase
                node_modules: {
                    stylelint:              mock.load("node_modules" +
                                                      "/stylelint/"),
                    "postcss-value-parser": mock.load("node_modules" +
                                                      "/postcss-value-parser/"),
                    "style-search":         mock.load("node_modules" +
                                                      "/style-search/"),
                },
                "foo.css":    "p { font-size: .5em }\n" +
                              "label::after { content: 'bar'; }",
            });

            const file    = "foo.css";
            const level   = SEVERITY.WARN;
            const options = {
                rules: {
                    "number-leading-zero": ["always", { severity: "warning" }],
                    "string-quotes":       "double",
                },
            };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "stylelint",
                    rule:      "number-leading-zero",
                    severity:  SEVERITY.WARN,
                    message:   "Expected a leading zero",
                    locations: [{ line: 1, column: 16 }],
                }, {
                    file,
                    linter:    "stylelint",
                    rule:      "string-quotes",
                    severity:  SEVERITY.ERROR,
                    message:   "Expected double quotes",
                    locations: [{ line: 2, column: 25 }],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                // eslint-disable-next-line camelcase
                node_modules: {
                    stylelint:              mock.load("node_modules" +
                                                      "/stylelint/"),
                    "postcss-value-parser": mock.load("node_modules" +
                                                      "/postcss-value-parser/"),
                    "style-search":         mock.load("node_modules" +
                                                      "/style-search/"),
                },
                "foo.css":    "span {\n" +
                              "    font-style: italic;\n" +
                              "}",
            });

            const file    = "foo.css";
            const level   = SEVERITY.ERROR;
            const options = {
                rules: { indentation: [2, { severity: "warning" }] },
            };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });
    });
});
