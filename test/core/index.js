import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../src/core/severity.js";
import metalint from "../../src/core/index.js";

describe("src/core/index.js", function () {
    describe("metalint()", function () {
        it("should return notices", async function () {
            mock({
                "src/core/":     mock.load("src/core/"),
                "node_modules/": mock.load("node_modules/"),
                "foo.html":      "<HTML></HTML>",
                "bar.md":        "## baz",
                "qux.js":        "alert('quux')",
            });

            const files    = ["foo.html", "bar.md", "qux.js"];
            const checkers = [
                {
                    patterns: ["*.js"],
                    linters:  {
                        "./wrapper/jshint.js": undefined,
                        "./wrapper/eslint.js":   {
                            rules: {
                                "no-alert": 2,
                                quotes:     2,
                            },
                        },
                    },
                    level:    SEVERITY.WARN,
                }, {
                    patterns: ["*.html"],
                    linters:  {
                        "./wrapper/htmlhint.js": { "tagname-lowercase": true },
                    },
                    level:    SEVERITY.FATAL,
                },
            ];

            const results = await metalint(files, checkers, ".");
            assert.deepStrictEqual(results, {
                "foo.html": [],
                "bar.md":   undefined,
                "qux.js":   [
                    {
                        file:      "qux.js",
                        linter:    "eslint",
                        rule:      "no-alert",
                        severity:  SEVERITY.ERROR,
                        message:   "Unexpected alert.",
                        locations: [{ line: 1, column: 1 }],
                    }, {
                        file:      "qux.js",
                        linter:    "eslint",
                        rule:      "quotes",
                        severity:  SEVERITY.ERROR,
                        message:   "Strings must use doublequote.",
                        locations: [{ line: 1, column: 7 }],
                    }, {
                        file:      "qux.js",
                        linter:    "jshint",
                        rule:      "W033",
                        severity:  SEVERITY.WARN,
                        message:   "Missing semicolon.",
                        locations: [{ line: 1, column: 14 }],
                    },
                ],
            });
        });

        it(`should add default "rule" and "severity"`, async function () {
            mock({
                "src/core/":     mock.load("src/core/"),
                "node_modules/": mock.load("node_modules/"),
                "foo.json":      "YAML",
            });

            const files    = ["foo.json"];
            const checkers = [
                {
                    patterns: ["**"],
                    linters:  { "./wrapper/json-lint.js": undefined },
                    level:    SEVERITY.INFO,
                },
            ];

            const results = await metalint(files, checkers, ".");
            assert.deepStrictEqual(results, {
                "foo.json": [
                    {
                        file:      "foo.json",
                        linter:    "json-lint",
                        severity:  SEVERITY.ERROR,
                        message:   "Unknown character 'Y', expecting" +
                                   " opening block '{' or '[', or maybe a" +
                                   " comment",
                        locations: [{ line: 1, column: 1 }],
                    },
                ],
            });
        });

        it(`should add default "locations"`, async function () {
            mock({
                "src/core/":     mock.load("src/core/"),
                "node_modules/": mock.load("node_modules/"),
                "foo.css":       ".black { color: black; }",
                "foo.html":      "<html></html>",
            });

            const files    = ["foo.css"];
            const checkers = [
                {
                    patterns: ["**"],
                    linters:  {
                        // Récupérer seulement les fichiers HTML à la racine
                        // pour exclure les fichiers HTML dans les paquets de
                        // node_modules/.
                        "./wrapper/purgecss.js": { content: "/*.html" },
                    },
                    level:    SEVERITY.INFO,
                },
            ];

            const results = await metalint(files, checkers, ".");
            assert.deepStrictEqual(results, {
                "foo.css": [
                    {
                        file:      "foo.css",
                        linter:    "purgecss",
                        severity:  SEVERITY.ERROR,
                        message:   "'.black' is never used.",
                        locations: [],
                    },
                ],
            });
        });

        it("should support sub-files", async function () {
            mock({
                "src/core/":         mock.load("src/core/"),
                "node_modules/":     mock.load("node_modules/"),
                "foo/manifest.json": "{ 'name': 'foo' }",
            });

            const files    = ["foo/"];
            const checkers = [
                {
                    patterns: ["foo/"],
                    linters:  { "./wrapper/addons-linter.js": undefined },
                    level:    SEVERITY.INFO,
                },
            ];

            const results = await metalint(files, checkers, ".");
            assert.deepStrictEqual(results, {
                "foo/":              [
                    {
                        file:      "foo/",
                        linter:    "addons-linter",
                        rule:      "JSON_INVALID",
                        severity:  SEVERITY.ERROR,
                        message:   "Your JSON is not valid.",
                        locations: [],
                    },
                ],
                "foo/manifest.json": [
                    {
                        file:      "foo/manifest.json",
                        linter:    "addons-linter",
                        rule:      "JSON_INVALID",
                        severity:  SEVERITY.ERROR,
                        message:   "Your JSON is not valid.",
                        locations: [],
                    },
                ],
            });
        });
    });
});
