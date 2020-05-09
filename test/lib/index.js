"use strict";

const assert   = require("assert");
const SEVERITY = require("../../lib/severity");
const metalint = require("../../lib/index");

const DATA_DIR = "test/data/lib/index";

describe("lib/index.js", function () {
    describe("metalint()", function () {
        it("", function () {
            const files    = [
                DATA_DIR + "/index.html", DATA_DIR + "/README.md",
                DATA_DIR + "/script.js",
            ];
            const checkers = [
                {
                    patterns: ["*.js"],
                    linters:  {
                        "./wrapper/jshint.js": null,
                        "./wrapper/jscs.js":   {
                            disallowFunctionDeclarations: true,
                            validateQuoteMarks:           `"`,
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

            return metalint(files, checkers, DATA_DIR).then(function (results) {
                assert.deepStrictEqual(results, {
                    [DATA_DIR + "/index.html"]: [],
                    [DATA_DIR + "/README.md"]:  null,
                    [DATA_DIR + "/script.js"]:  [
                        {
                            file:      DATA_DIR + "/script.js",
                            linter:    "jscs",
                            rule:      "disallowFunctionDeclarations",
                            severity:  SEVERITY.ERROR,
                            message:   "Illegal function declaration",
                            locations: [{ line: 1, column: 1 }],
                        }, {
                            file:      DATA_DIR + "/script.js",
                            linter:    "jscs",
                            rule:      "validateQuoteMarks",
                            severity:  SEVERITY.ERROR,
                            message:   "Invalid quote mark found",
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
        });

        it("", function () {
            const files    = [DATA_DIR + "/README.md"];
            const checkers = [
                {
                    patterns: ["**"],
                    linters:  { "./wrapper/markdownlint.js": null },
                    level:    SEVERITY.INFO,
                },
            ];

            return metalint(files, checkers, DATA_DIR).then(function (results) {
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
        });

        it(`should add default "rule" and "severity"`, function () {
            const files    = [DATA_DIR + "/config.json"];
            const checkers = [
                {
                    patterns: ["**"],
                    linters:  { "./wrapper/json-lint.js": null },
                    level:    SEVERITY.INFO,
                },
            ];

            return metalint(files, checkers, DATA_DIR).then(function (results) {
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
        });

        it(`should add default "locations"`, function () {
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
            return metalint(files, checkers, DATA_DIR).then(function (results) {
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
        });

        it("should support sub-files", function () {
            const files    = [DATA_DIR + "/group/"];
            const checkers = [
                {
                    patterns: ["/group/"],
                    linters:  { "./wrapper/addons-linter.js": null },
                    level:    SEVERITY.INFO,
                },
            ];

            return metalint(files, checkers, DATA_DIR).then(function (results) {
                assert.deepStrictEqual(results, {
                    [DATA_DIR + "/group/"]:              [],
                    [DATA_DIR + "/group/manifest.json"]: [
                        {
                            file:      DATA_DIR + "/group/manifest.json",
                            linter:    "addons-linter",
                            rule:      "JSON_INVALID",
                            severity:  SEVERITY.ERROR,
                            message:   "Your JSON is not valid.",
                            locations: [],
                        }, {
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
});
