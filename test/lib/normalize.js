"use strict";

const assert    = require("assert");
const path      = require("path");
const normalize = require("../../lib/normalize.js");
const SEVERITY  = require("../../lib/severity.js");
const console   = require("../../lib/reporter/console.js");
const csv       = require("../../lib/reporter/csv.js");

const runfail = function (rotten) {
    try {
        normalize(rotten, null);
        assert.fail();
    } catch (_) {
        // Ne rien faire.
    }
}; // runfail()

describe("lib/normalize.js", function () {
    it("", function () {
        const rotten = { "checkers": [{ "linters": { "eslint": {} } }] };
        const standard = normalize(rotten,
                                   path.join(__dirname, "../data/.metalint"));
        assert.deepStrictEqual(standard, {
            "patterns": ["**"],
            "hidden":   false,
            "level":    SEVERITY.INFO,
            "reporter": console,
            "verbose":  0,
            "output":   process.stdout,
            "checkers": [
                {
                    "patterns": ["**"],
                    "hidden":   false,
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
            "patterns": "**.js",
            "hidden":   true,
            "level":    "ERROR",
            "reporter": "csv",
            "verbose":  2,
            "output":   null,
            "checkers": [
                {
                    "hidden":  false,
                    "level":   "INFO",
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
        const standard = normalize(rotten,
                                   path.join(__dirname, "../data/.metalint"));
        assert.deepEqual(standard, {
            "patterns": ["**.js"],
            "hidden":   true,
            "level":    SEVERITY.ERROR,
            "reporter": csv,
            "verbose":  2,
            "output":   process.stdout,
            "checkers": [
                {
                    "patterns": ["**"],
                    "hidden":   false,
                    "level":    SEVERITY.ERROR,
                    "linters":  {
                        "markdownlint": { "MD035": { "style": "---" } }
                    }
                }, {
                    "patterns": ["!**.min.js", "**"],
                    "hidden":   true,
                    "level":    SEVERITY.ERROR,
                    "linters":  {
                        "eslint": {
                            "rules": { "no-empty": 2, "curly": 1, "no-var": 2 }
                        }
                    }
                }, {
                    "patterns": ["**"],
                    "hidden":   true,
                    "level":    SEVERITY.ERROR,
                    "linters":  {
                        "htmlhint": { "tagname-lowercase": true },
                        "htmllint": { "doctype-html5": true }
                    }
                }, {
                    "patterns": ["**"],
                    "hidden":   true,
                    "level":    SEVERITY.ERROR,
                    "linters":  { "csslint": { "empty-rules": true } }
                }
            ]
        });
    });

    it("", function () {
        const rotten = { "checkers": [{ "linters": { "jsonlint": [1] } }] };
        runfail(rotten);

        rotten.checkers[0].linters.jsonlint[0] = null;
        runfail(rotten);

        rotten.checkers[0].linters.jsonlint = 1;
        runfail(rotten);

        rotten.checkers[0].linters = 1;
        runfail(rotten);

        rotten.checkers[0].linters = null;
        runfail(rotten);

        delete rotten.checkers[0].linters;
        runfail(rotten);

        rotten.checkers.length = 0;
        runfail(rotten);

        rotten.checkers = 1;
        runfail(rotten);

        rotten.output = 1;
        runfail(rotten);

        rotten.verbose = "Blablabla";
        runfail(rotten);

        rotten.reporter = 1;
        runfail(rotten);

        rotten.level = "APOCALYPSE";
        runfail(rotten);

        rotten.level = 1;
        runfail(rotten);

        rotten.hidden = 1;
        runfail(rotten);

        rotten.patterns = 1;
        runfail(rotten);
    });
});
