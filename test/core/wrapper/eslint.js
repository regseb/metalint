import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/eslint.js";

describe("src/core/wrapper/eslint.js", function () {
    describe("wrapper()", function () {
        it("should ignore with OFF level", async function () {
            const file    = "";
            const level   = SEVERITY.OFF;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should use default options", async function () {
            mock({ "foo.js": `console.log("bar");` });

            const file    = "foo.js";
            const level   = SEVERITY.INFO;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should return notices", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.js":        "var bar = 1;\n" +
                                 "switch (bar) {\n" +
                                 "    case 1: break;\n" +
                                 "   case 2: break;\n" +
                                 "    case 2: break;\n" +
                                 "}",
            });

            const file    = "foo.js";
            const level   = SEVERITY.WARN;
            const options = {
                rules: {
                    indent:              [1, 4, { SwitchCase: 1 }],
                    "no-duplicate-case": 2,
                },
            };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "eslint",
                    rule:      "indent",
                    severity:  SEVERITY.WARN,
                    message:   "Expected indentation of 4 spaces but found 3.",
                    locations: [{
                        line:      4,
                        column:    1,
                        endLine:   4,
                        endColumn: 4,
                    }],
                }, {
                    file,
                    linter:    "eslint",
                    rule:      "no-duplicate-case",
                    severity:  SEVERITY.ERROR,
                    message:   "Duplicate case label.",
                    locations: [{
                        line:      5,
                        column:    5,
                        endLine:   5,
                        endColumn: 19,
                    }],
                },
            ]);
        });

        it("should ignore warning with ERROR level", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.js":        "var bar = 2 << 9;",
            });

            const file    = "foo.js";
            const level   = SEVERITY.ERROR;
            const options = { rules: { "no-bitwise": 1 } };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should return FATAL notice", async function () {
            mock({ "foo.js": "var bar = ;" });

            const file    = "foo.js";
            const level   = SEVERITY.INFO;
            const options = undefined;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "eslint",
                    severity:  SEVERITY.FATAL,
                    message:   "Parsing error: Unexpected token ;",
                    locations: [{ line: 1, column: 11 }],
                },
            ]);
        });

        it("should support plugins", async function () {
            mock({
                // Ne pas simuler le répertoire "node_modules" car le linter
                // doit accéder à des fichiers dans celui-ci.
                "node_modules/": mock.load("node_modules/"),
                "foo.js":        "// filenames/no-index\n" +
                                 "bar(function(baz) { return baz; });\n" +
                                 "\n" +
                                 "/**\n" +
                                 " * Qux.\n" +
                                 " *\n" +
                                 " * @returns {Object} Quux.\n" +
                                 " */\n" +
                                 "function corge() { return {}; }",
            });

            const file    = "foo.js";
            const level   = SEVERITY.INFO;
            const options = {
                plugins: ["jsdoc", "mocha"],
                rules:   {
                    "jsdoc/check-types":           2,
                    "jsdoc/check-syntax":          2,
                    "mocha/prefer-arrow-callback": 2,
                },
            };

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "eslint",
                    rule:      "mocha/prefer-arrow-callback",
                    severity:  SEVERITY.ERROR,
                    message:   "Unexpected function expression.",
                    locations: [{
                        line:      2,
                        column:    5,
                        endLine:   2,
                        endColumn: 34,
                    }],
                }, {
                    file,
                    linter:    "eslint",
                    rule:      "jsdoc/check-types",
                    severity:  SEVERITY.ERROR,
                    message:   `Invalid JSDoc @returns type "Object"; prefer:` +
                               ` "object".`,
                    locations: [{
                        line:      7,
                        column:    1,
                        endLine:   7,
                        endColumn: 1,
                    }],
                },
            ]);
        });
    });
});
