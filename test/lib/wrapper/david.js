import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/david.js";

const DATA_DIR = "test/data/lib/wrapper/david";

describe("lib/wrapper/david.js", function () {
    it("wrapper()", async function () {
        const file    = DATA_DIR + "/package1.json";
        const level   = SEVERITY.INFO;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.strictEqual(notices.length, 1);
        assert.strictEqual(notices[0].file, file);
        assert.strictEqual(notices[0].linter, "david");
        assert.strictEqual(notices[0].rule, null);
        assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
        assert.ok(notices[0].message.startsWith("New stable version "));
        assert.ok(notices[0].message.endsWith(" is released to dependencies" +
                                              " 'npm'."));
        assert.deepStrictEqual(notices[0].locations, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/package1.json";
        const level   = SEVERITY.INFO;
        const options = {
            dev:      false,
            optional: true,
            peer:     true,
        };

        const notices = await wrapper(file, level, options);
        assert.strictEqual(notices.length, 2);

        assert.strictEqual(notices[0].file, file);
        assert.strictEqual(notices[0].linter, "david");
        assert.strictEqual(notices[0].rule, null);
        assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
        assert.ok(notices[0].message.startsWith("New stable version "));
        assert.ok(notices[0].message.endsWith(" is released to dependencies" +
                                              " 'npm'."));
        assert.deepStrictEqual(notices[0].locations, []);

        assert.deepStrictEqual(notices[1], {
            file,
            linter:    "david",
            rule:      null,
            severity:  SEVERITY.FATAL,
            message:   "'metalint-with-typo' is not in the npm registry.\nYou" +
                       " should bug the author to publish it\n(or use the" +
                       " name yourself!)\n\nNote that you can also install" +
                       " from a\ntarball, folder, http url, or git url.",
            locations: [],
        });
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/package1.json";
        const level   = SEVERITY.INFO;
        const options = {
            dev:      true,
            optional: false,
            peer:     false,
        };

        const notices = await wrapper(file, level, options);
        assert.strictEqual(notices.length, 2);

        assert.strictEqual(notices[0].file, file);
        assert.strictEqual(notices[0].linter, "david");
        assert.strictEqual(notices[0].rule, null);
        assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
        assert.ok(notices[0].message.startsWith("New stable version "));
        assert.ok(notices[0].message.endsWith(" is released to dependencies" +
                                              " 'npm'."));
        assert.deepStrictEqual(notices[0].locations, []);

        assert.strictEqual(notices[1].file, file);
        assert.strictEqual(notices[1].linter, "david");
        assert.strictEqual(notices[1].rule, null);
        assert.strictEqual(notices[1].severity, SEVERITY.ERROR);
        assert.ok(notices[1].message.startsWith("New stable version "));
        assert.ok(notices[1].message.endsWith(" is released to" +
                                              " devDependencies 'npx'."));
        assert.deepStrictEqual(notices[1].locations, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/package1.json";
        const level   = SEVERITY.INFO;
        const options = {
            dev:      true,
            optional: false,
            peer:     true,
        };

        const notices = await wrapper(file, level, options);
        assert.strictEqual(notices.length, 2);

        assert.strictEqual(notices[0].file, file);
        assert.strictEqual(notices[0].linter, "david");
        assert.strictEqual(notices[0].rule, null);
        assert.strictEqual(notices[0].severity, SEVERITY.ERROR);
        assert.ok(notices[0].message.startsWith("New stable version "));
        assert.ok(notices[0].message.endsWith(" is released to dependencies" +
                                              " 'npm'."));
        assert.deepStrictEqual(notices[0].locations, []);

        assert.strictEqual(notices[1].file, file);
        assert.strictEqual(notices[1].linter, "david");
        assert.strictEqual(notices[1].rule, null);
        assert.strictEqual(notices[1].severity, SEVERITY.ERROR);
        assert.ok(notices[1].message.startsWith("New stable version "));
        assert.ok(notices[1].message.endsWith(" is released to" +
                                              " devDependencies 'npx'."));
        assert.deepStrictEqual(notices[1].locations, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/package1.json";
        const level   = SEVERITY.OFF;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
