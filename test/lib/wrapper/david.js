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
            assert.strictEqual(notices[0].file, file);
            assert.strictEqual(notices[0].linter, "david");
            assert.ok(!("rule" in notices[0]));
            assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
            assert.ok(notices[0].message.startsWith("New stable version "));
            assert.ok(notices[0].message.endsWith(" is released to" +
                                                  " dependencies 'npm'."));
            assert.ok(!("locations" in notices[0]));
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

            assert.strictEqual(notices[0].file, file);
            assert.strictEqual(notices[0].linter, "david");
            assert.ok(!("rule" in notices[0]));
            assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
            assert.ok(notices[0].message.startsWith("New stable version "));
            assert.ok(notices[0].message.endsWith(" is released to" +
                                                  " dependencies 'npm'."));
            assert.ok(!("locations" in notices[0]));

            assert.deepStrictEqual(notices[1], {
                "file":     file,
                "linter":   "david",
                "severity": SEVERITY.FATAL,
                "message":  "'metalint-with-typo' is not in the npm" +
                            " registry.\nYou should bug the author to publish" +
                            " it\n(or use the name yourself!)\n\nNote that" +
                            " you can also install from a\ntarball, folder," +
                            " http url, or git url."
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

            assert.strictEqual(notices[0].file, file);
            assert.strictEqual(notices[0].linter, "david");
            assert.ok(!("rule" in notices[0]));
            assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
            assert.ok(notices[0].message.startsWith("New stable version "));
            assert.ok(notices[0].message.endsWith(" is released to" +
                                                  " dependencies 'npm'."));
            assert.ok(!("locations" in notices[0]));

            assert.strictEqual(notices[1].file, file);
            assert.strictEqual(notices[1].linter, "david");
            assert.ok(!("rule" in notices[1]));
            assert.strictEqual(notices[1].severity, SEVERITY.ERROR);
            assert.ok(notices[1].message.startsWith("New stable version "));
            assert.ok(notices[1].message.endsWith(" is released to" +
                                                  " devDependencies 'npx'."));
            assert.ok(!("locations" in notices[1]));
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

            assert.strictEqual(notices[0].file, file);
            assert.strictEqual(notices[0].linter, "david");
            assert.ok(!("rule" in notices[0]));
            assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
            assert.ok(notices[0].message.startsWith("New stable version "));
            assert.ok(notices[0].message.endsWith(" is released to" +
                                                  " dependencies 'npm'."));
            assert.ok(!("locations" in notices[0]));

            assert.strictEqual(notices[1].file, file);
            assert.strictEqual(notices[1].linter, "david");
            assert.ok(!("rule" in notices[1]));
            assert.strictEqual(notices[1].severity, SEVERITY.ERROR);
            assert.ok(notices[1].message.startsWith("New stable version "));
            assert.ok(notices[1].message.endsWith(" is released to" +
                                                  " devDependencies 'npx'."));
            assert.ok(!("locations" in notices[1]));
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
