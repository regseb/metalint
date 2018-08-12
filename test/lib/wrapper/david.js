"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/david");

const DATA_DIR = "test/data/lib/wrapper/david";

describe("lib/wrapper/david.js", function () {
    it("configure()", function () {
        const checker = linter.configure();
        assert.deepStrictEqual(checker, {
            "patterns": "/package.json",
            "linters":  { "david": {} }
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/package1.json";
        const level   = SEVERITY.INFO;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.strictEqual(notices.length, 1);
            assert.strictEqual(notices[0].linter, "david");
            assert.strictEqual(notices[0].rule, null);
            assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
            assert.ok(notices[0].message.startsWith("New stable version "));
            assert.ok(notices[0].message.endsWith(" is released to" +
                                                  " dependencies 'npm'."));
            assert.deepStrictEqual(notices[0].locations, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/package1.json";
        const level   = SEVERITY.INFO;
        const options = {
            "dev":      false,
            "optional": true,
            "peer":     true
        };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.strictEqual(notices.length, 2);

            assert.strictEqual(notices[0].linter, "david");
            assert.strictEqual(notices[0].rule, null);
            assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
            assert.ok(notices[0].message.startsWith("New stable version "));
            assert.ok(notices[0].message.endsWith(" is released to" +
                                                  " dependencies 'npm'."));
            assert.deepStrictEqual(notices[0].locations, []);

            assert.deepStrictEqual(notices[1], {
                "linter":    "david",
                "rule":      null,
                "severity":  SEVERITY.FATAL,
                "message":   "Not found : metalint-with-typo",
                "locations": []
            });
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/package1.json";
        const level   = SEVERITY.INFO;
        const options = {
            "dev":      true,
            "optional": false,
            "peer":     false
        };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.strictEqual(notices.length, 2);

            assert.strictEqual(notices[0].linter, "david");
            assert.strictEqual(notices[0].rule, null);
            assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
            assert.ok(notices[0].message.startsWith("New stable version "));
            assert.ok(notices[0].message.endsWith(" is released to" +
                                                  " dependencies 'npm'."));
            assert.deepStrictEqual(notices[0].locations, []);

            assert.strictEqual(notices[1].linter, "david");
            assert.strictEqual(notices[1].rule, null);
            assert.strictEqual(notices[1].severity, SEVERITY.ERROR);
            assert.ok(notices[1].message.startsWith("New stable version "));
            assert.ok(notices[1].message.endsWith(" is released to" +
                                                  " devDependencies 'npx'."));
            assert.deepStrictEqual(notices[1].locations, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/package1.json";
        const level   = SEVERITY.INFO;
        const options = {
            "dev":      true,
            "optional": false,
            "peer":     true
        };

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.strictEqual(notices.length, 2);

            assert.strictEqual(notices[0].linter, "david");
            assert.strictEqual(notices[0].rule, null);
            assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
            assert.ok(notices[0].message.startsWith("New stable version "));
            assert.ok(notices[0].message.endsWith(" is released to" +
                                                  " dependencies 'npm'."));
            assert.deepStrictEqual(notices[0].locations, []);

            assert.strictEqual(notices[1].linter, "david");
            assert.strictEqual(notices[1].rule, null);
            assert.strictEqual(notices[1].severity, SEVERITY.ERROR);
            assert.ok(notices[1].message.startsWith("New stable version "));
            assert.ok(notices[1].message.endsWith(" is released to" +
                                                  " devDependencies 'npx'."));
            assert.deepStrictEqual(notices[1].locations, []);
        });
    });

    it("wrapper()", function () {
        const file    = DATA_DIR + "/package1.json";
        const level   = SEVERITY.OFF;
        const options = {};

        return linter.wrapper(file, level, options).then(function (notices) {
            assert.deepStrictEqual(notices, []);
        });
    });
});
