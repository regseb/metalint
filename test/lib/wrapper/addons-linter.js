"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity.js");
const wrapper  = require("../../../lib/wrapper/addons-linter.js");

const DATA_DIR = "../data/lib/wrapper/addons-linter";

describe("lib/wrapper/addons-linter.js", function () {
    it("", function () {
        const file    = DATA_DIR + "/addon.xpi";
        const options = null;
        const level   = SEVERITY.INFO;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });

    it("", function () {
        const file    = DATA_DIR + "/addon/";
        const options = null;
        const level   = SEVERITY.WARN;

        return wrapper(file, options, level).then(function (notices) {
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

    it("", function () {
        const file    = DATA_DIR + "/addon.xpi";
        const options = null;
        const level   = SEVERITY.FATAL;

        return wrapper(file, options, level).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
