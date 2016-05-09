"use strict";

const streams  = require("memory-streams");
const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const reporter = require("../../../lib/reporter/json.js");

describe("lib/reporter/json.js", function () {
    it("", function () {
        const promise = Promise.resolve({
            "index.html": null
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.equal(null, severity);
            assert.equal("{\"index.html\":null}\n", writer.toString());
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "index.html": []
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 0).then(function (severity) {
            assert.equal(null, severity);
            assert.equal("{\"index.html\":[]}\n", writer.toString());
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "tools.js": [
                {
                    "linter":    "eslint",
                    "rule":      "no-unused-vars",
                    "severity":  SEVERITY.ERROR,
                    "message":   "'superflous' is defined but never used",
                    "locations": [{ "line": 2, "column": 7 }]
                }
            ]
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 2).then(function (severity) {
            assert.equal(SEVERITY.ERROR, severity);
            assert.equal(
                "{\n" +
                "  \"tools.js\": [\n" +
                "    {\n" +
                "      \"linter\": \"eslint\",\n" +
                "      \"rule\": \"no-unused-vars\",\n" +
                "      \"severity\": 2,\n" +
                "      \"message\": \"'superflous' is defined but never"
                                  + " used\",\n" +
                "      \"locations\": [\n" +
                "        {\n" +
                "          \"line\": 2,\n" +
                "          \"column\": 7\n" +
                "        }\n" +
                "      ]\n" +
                "    }\n" +
                "  ]\n" +
                "}\n",
                writer.toString());
        });
    });

    it("", function () {
        const promise = Promise.resolve({
            "README.md": [
                {
                    "linter":    "markdownlint",
                    "rule":      "MD002",
                    "severity":  SEVERITY.ERROR,
                    "message":   "First header should be a h1 header.",
                    "locations": [{ "line": 1 }]
                }
            ],
            "script.js": [
                {
                    "linter":    "jscs",
                    "rule":      null,
                    "severity":  SEVERITY.ERROR,
                    "message":   "Illegal keyword: with.",
                    "locations": [{ "line": 47, "column": 8 }]
                }, {
                    "linter":    "jshint",
                    "rule":      "E007",
                    "severity":  SEVERITY.ERROR,
                    "message":   "Missing \"use strict\" statement.",
                    "locations": [{ "line": 12, "column": 2 }]
                }
            ]
        });
        const writer = new streams.WritableStream();

        return reporter(promise, writer, 4).then(function (severity) {
            assert.equal(SEVERITY.ERROR, severity);
            assert.equal(
                "{\n" +
                "    \"README.md\": [\n" +
                "        {\n" +
                "            \"linter\": \"markdownlint\",\n" +
                "            \"rule\": \"MD002\",\n" +
                "            \"severity\": 2,\n" +
                "            \"message\": \"First header should be a h1" +
                                          " header.\",\n" +
                "            \"locations\": [\n" +
                "                {\n" +
                "                    \"line\": 1\n" +
                "                }\n" +
                "            ]\n" +
                "        }\n" +
                "    ],\n" +
                "    \"script.js\": [\n" +
                "        {\n" +
                "            \"linter\": \"jscs\",\n" +
                "            \"rule\": null,\n" +
                "            \"severity\": 2,\n" +
                "            \"message\": \"Illegal keyword: with.\",\n" +
                "            \"locations\": [\n" +
                "                {\n" +
                "                    \"line\": 47,\n" +
                "                    \"column\": 8\n" +
                "                }\n" +
                "            ]\n" +
                "        },\n" +
                "        {\n" +
                "            \"linter\": \"jshint\",\n" +
                "            \"rule\": \"E007\",\n" +
                "            \"severity\": 2,\n" +
                "            \"message\": \"Missing \\\"use strict\\\"" +
                                          " statement.\",\n" +
                "            \"locations\": [\n" +
                "                {\n" +
                "                    \"line\": 12,\n" +
                "                    \"column\": 2\n" +
                "                }\n" +
                "            ]\n" +
                "        }\n" +
                "    ]\n" +
                "}\n",
                writer.toString());
        });
    });
});
