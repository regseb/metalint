"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/addons-linter");

const DATA_DIR = "../data/lib/wrapper/addons-linter";

describe("lib/wrapper/addons-linter.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            "patterns": "**/*.xpi",
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
        const file  = DATA_DIR + "/addon/";
        const level = SEVERITY.WARN;

        return linter.wrapper(file, level).then(function (notices) {
            assert.deepStrictEqual(notices, [
                {
                    "linter":    "addons-linter",
                    "rule":      "MANIFEST_FIELD_REQUIRED",
                    "severity":  SEVERITY.ERROR,
                    "message":   "\"/name\" is a required property",
                    "locations": []
                }, {
                    "linter":    "addons-linter",
                    "rule":      "MANIFEST_PERMISSIONS",
                    "severity":  SEVERITY.WARN,
                    "message":   "/permissions: Unknown permissions \"god" +
                                 " mode\" at 0.",
                    "locations": []
                }, {
                    "linter":    "addons-linter",
                    "rule":      "PROP_VERSION_TOOLKIT_ONLY",
                    "severity":  SEVERITY.INFO,
                    "message":   "The \"version\" property uses a" +
                                 " Firefox-specific format.",
                    "locations": []
                }
            ]);
        });
    });

    it("wrapper()", function () {
        const file  = DATA_DIR + "/addon/";
        const level = SEVERITY.FATAL;

        return linter.wrapper(file, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
