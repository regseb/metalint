import assert from "assert";
import { SEVERITY } from "../../lib/severity.js";
import { metalint } from "../../lib/index.js";

const DATA_DIR = "test/data/lib/index";

describe("lib/index.js", function () {
    describe("metalint()", function () {
        it("", async function () {
            const files    = [
                DATA_DIR + "/index.html",
                DATA_DIR + "/README.md",
                DATA_DIR + "/script.js",
            ];
            const checkers = [
                {
                    patterns: ["*.js"],
                    linters:  {
                        "./wrapper/jshint.js": null,
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

            const results = await metalint(files, checkers, DATA_DIR);
            assert.deepStrictEqual(results, {
                [DATA_DIR + "/index.html"]: [],
                [DATA_DIR + "/README.md"]:  null,
                [DATA_DIR + "/script.js"]:  [
                    {
                        file:      DATA_DIR + "/script.js",
                        linter:    "eslint",
                        rule:      "no-alert",
                        severity:  SEVERITY.ERROR,
                        message:   "Unexpected alert.",
                        locations: [{ line: 2, column: 5 }],
                    }, {
                        file:      DATA_DIR + "/script.js",
                        linter:    "eslint",
                        rule:      "quotes",
                        severity:  SEVERITY.ERROR,
                        message:   "Strings must use doublequote.",
                        locations: [{ line: 2, column: 11 }],
                    }, {
                        file:      DATA_DIR + "/script.js",
                        linter:    "jshint",
                        rule:      "W033",
                        severity:  SEVERITY.WARN,
                        message:   "Missing semicolon.",
                        locations: [{ line: 2, column: 26 }],
                    },
                ],
            });
        });

        it("", async function () {
            const files    = [DATA_DIR + "/README.md"];
            const checkers = [
                {
                    patterns: ["**"],
                    linters:  { "./wrapper/markdownlint.js": null },
                    level:    SEVERITY.INFO,
                },
            ];

            const results = await metalint(files, checkers, DATA_DIR);
            assert.deepStrictEqual(results, {
                [DATA_DIR + "/README.md"]: [
                    {
                        file:      DATA_DIR + "/README.md",
                        linter:    "markdownlint",
                        rule:      "MD041/first-line-heading" +
                                                           "/first-line-h1",
                        severity:  SEVERITY.ERROR,
                        message:   "First line in file should be a top" +
                                   ` level heading [Context: "## README"]`,
                        locations: [{ line: 1 }],
                    },
                ],
            });
        });

        it(`should add default "rule" and "severity"`, async function () {
            const files    = [DATA_DIR + "/config.json"];
            const checkers = [
                {
                    patterns: ["**"],
                    linters:  { "./wrapper/json-lint.js": null },
                    level:    SEVERITY.INFO,
                },
            ];

            const results = await metalint(files, checkers, DATA_DIR);
            assert.deepStrictEqual(results, {
                [DATA_DIR + "/config.json"]: [
                    {
                        file:      DATA_DIR + "/config.json",
                        linter:    "json-lint",
                        rule:      null,
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
            const cwd = process.cwd();

            const files    = ["style.css"];
            const checkers = [
                {
                    patterns: ["**"],
                    linters:  {
                        "./wrapper/purgecss.js": { content: "*.html" },
                    },
                    level:    SEVERITY.INFO,
                },
            ];

            process.chdir(DATA_DIR);
            const results = await metalint(files, checkers, DATA_DIR);
            assert.deepStrictEqual(results, {
                "style.css": [
                    {
                        file:      "style.css",
                        linter:    "purgecss",
                        rule:      null,
                        severity:  SEVERITY.ERROR,
                        message:   "'.black' is never used.",
                        locations: [],
                    },
                ],
            });
            process.chdir(cwd);
        });

        it("should support sub-files", async function () {
            const files    = [DATA_DIR + "/group/"];
            const checkers = [
                {
                    patterns: ["/group/"],
                    linters:  { "./wrapper/addons-linter.js": null },
                    level:    SEVERITY.INFO,
                },
            ];

            const results = await metalint(files, checkers, DATA_DIR);
            assert.deepStrictEqual(results, {
                [DATA_DIR + "/group/"]:              [
                    {
                        file:      DATA_DIR + "/group/",
                        linter:    "addons-linter",
                        rule:      "JSON_INVALID",
                        severity:  SEVERITY.ERROR,
                        message:   "Your JSON is not valid.",
                        locations: [],
                    },
                ],
                [DATA_DIR + "/group/manifest.json"]: [
                    {
                        file:      DATA_DIR + "/group/manifest.json",
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
