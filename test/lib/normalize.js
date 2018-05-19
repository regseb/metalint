"use strict";

const assert    = require("assert");
const path      = require("path");
const normalize = require("../../lib/normalize");
const SEVERITY  = require("../../lib/severity");
const Console   = require("../../lib/reporter/console");
const Csv       = require("../../lib/reporter/csv");
const French    = require("../data/reporter/french");

describe("lib/normalize.js", function () {
    it("", function () {
        const rotten = { "checkers": [{ "linters": { "eslint": {} } }] };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir);

        assert.deepStrictEqual(standard, {
            "patterns":  ["**"],
            "level":     SEVERITY.INFO,
            "reporters": [
                new Console(SEVERITY.INFO, process.stdout, {})
            ],
            "checkers":  [
                {
                    "patterns": ["**"],
                    "level":    SEVERITY.INFO,
                    "linters":  {
                        "eslint": {}
                    }
                }
            ]
        });
    });

    it("", function () {
        const rotten = {
            "patterns":  "**.js",
            "level":     "Error",
            "reporters": {
                "name":   "CSV",
                "output": null
            },
            "checkers":  [
                {
                    "level":   "info",
                    "linters": "markdownlint"
                }, {
                    "patterns": ["!**.min.js", "**"],
                    "linters":  {
                        "eslint": [
                            "eslint.json",
                            { "rules": { "curly": 1, "no-var": 2 } }
                        ]
                    }
                }, {
                    "linters": ["htmllint", "htmlhint"]
                }, {
                    "linters": { "csslint": "csslintrc" }
                }
            ]
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        const standard = normalize(rotten, root, dir);

        assert.deepStrictEqual(standard, {
            "patterns":  ["**.js"],
            "level":     SEVERITY.ERROR,
            "reporters": [
                new Csv(SEVERITY.ERROR, process.stdout)
            ],
            "checkers":  [
                {
                    "patterns": ["**"],
                    "level":    SEVERITY.ERROR,
                    "linters":  {
                        "markdownlint": { "MD035": { "style": "---" } }
                    }
                }, {
                    "patterns": ["!**.min.js", "**"],
                    "level":    SEVERITY.ERROR,
                    "linters":  {
                        "eslint": {
                            "rules": { "no-empty": 2, "curly": 1, "no-var": 2 }
                        }
                    }
                }, {
                    "patterns": ["**"],
                    "level":    SEVERITY.ERROR,
                    "linters":  {
                        "htmlhint": { "tagname-lowercase": true },
                        "htmllint": { "doctype-html5": true }
                    }
                }, {
                    "patterns": ["**"],
                    "level":    SEVERITY.ERROR,
                    "linters":  { "csslint": { "empty-rules": true } }
                }
            ]
        });
    });

    it("", function () {
        const rotten = {
            "checkers": [
                {
                    "linters": "jsonlint"
                }
            ]
        };
        const root = path.join(__dirname, "../data/");
        const dir  = path.join(root, ".metalint");
        assert.throws(() => normalize(rotten, root, dir), {
            "name":    "Error",
            "message": path.join(__dirname, "../data/.metalint/jsonlint.json") +
                       ": Parse error on line 1:\n" +
                       "<xml></xml>\n" +
                       "^\n" +
                       "Expecting 'STRING', 'NUMBER', 'NULL', 'TRUE'," +
                       " 'FALSE', '{', '[', got 'undefined'"
        });
    });

    it("", function () {
        const rotten = {
            "reporters": {
                "name": "reporter/french"
            },
            "checkers":  [{ "linters": { "eslint": {} } }]
        };
        const root = path.join(__dirname, "../data/");
        const standard = normalize(rotten, root, null);
        assert.deepStrictEqual(standard, {
            "patterns":  ["**"],
            "level":     SEVERITY.INFO,
            "reporters": [
                new French(SEVERITY.INFO, process.stdout)
            ],
            "checkers":  [
                {
                    "patterns": ["**"],
                    "level":    SEVERITY.INFO,
                    "linters":  {
                        "eslint": {}
                    }
                }
            ]
        });
    });

    it("", function () {
        const rotten = { "checkers": [{ "linters": { "jsonlint": [1] } }] };
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "linter option incorrect type."
        });

        rotten.checkers[0].linters.jsonlint[0] = null;
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "linter option is null."
        });

        rotten.checkers[0].linters.jsonlint = 1;
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "linter incorrect type."
        });

        rotten.checkers[0].linters = 1;
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "'checkers[].linters' incorrect type."
        });

        rotten.checkers[0].linters = null;
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "'checkers[].linters' is null."
        });

        Reflect.deleteProperty(rotten.checkers[0], "linters");
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "'checkers[].linters' is undefined."
        });

        rotten.checkers.length = 0;
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "'checkers' is empty."
        });

        rotten.checkers = 1;
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "'checkers' is not an array."
        });

        rotten.reporters = 1;
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "'reporters' incorrect type."
        });

        rotten.level = "APOCALYPSE";
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "value of property 'level' is unknown (possibles" +
                       " values : 'off', 'fatal', 'error', 'warn' and 'info')."
        });

        rotten.level = 1;
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "property 'level' is incorrect type (only string is" +
                       " accepted)."
        });

        rotten.patterns = 1;
        assert.throws(() => normalize(rotten, null, null), {
            "name":    "Error",
            "message": "property 'patterns' is incorrect type (string and" +
                       " array are accepted)."
        });
    });
});
