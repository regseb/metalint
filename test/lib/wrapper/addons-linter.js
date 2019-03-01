"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/addons-linter");

const DATA_DIR = "test/data/lib/wrapper/addons-linter";

describe("lib/wrapper/addons-linter.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            "patterns": "*.xpi",
            "linters":  { "addons-linter": null }
        });
    });

    it("wrapper()", function () {
        const file  = DATA_DIR + "/addon.xpi";
        const level = SEVERITY.INFO;

        return linter.wrapper(file, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("wrapper()", function () {
        const file  = DATA_DIR + "/addon1/";
        const level = SEVERITY.WARN;

        return linter.wrapper(file, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file + "manifest.json",
                    "linter":    "addons-linter",
                    "rule":      "MANIFEST_FIELD_REQUIRED",
                    "severity":  SEVERITY.ERROR,
                    "message":   "\"/name\" is a required property"
                }, {
                    "file":      file + "manifest.json",
                    "linter":    "addons-linter",
                    "rule":      "MANIFEST_PERMISSIONS",
                    "severity":  SEVERITY.WARN,
                    "message":   "/permissions: Unknown permissions \"god" +
                                 " mode\" at 0."
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file  = DATA_DIR + "/addon2/";
        const level = SEVERITY.INFO;

        return linter.wrapper(file, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "file":      file,
                    "linter":    "addons-linter",
                    "rule":      "TYPE_NO_MANIFEST_JSON",
                    "severity":  SEVERITY.ERROR,
                    "message":   "manifest.json was not found"
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file  = DATA_DIR + "/addon2/";
        const level = SEVERITY.FATAL;

        return linter.wrapper(file, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
