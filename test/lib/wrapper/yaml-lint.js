"use strict";

const assert   = require("assert");
const SEVERITY = require("../../../lib/severity");
const linter   = require("../../../lib/wrapper/yaml-lint");

const DATA_DIR = "test/data/lib/wrapper/yaml-lint";

describe("lib/wrapper/yaml-lint.js", function () {
    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure1/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: ["*.yaml", "*.yml"],
            linters:  { "yaml-lint": null },
        });
    });

    it("configure()", function () {
        const cwd = process.cwd();

        process.chdir(DATA_DIR + "/configure2/");
        const checker = linter.configure();
        process.chdir(cwd);

        assert.deepStrictEqual(checker, {
            patterns: ["*.yaml", "*.yml"],
            linters:  { "yaml-lint": "../.yaml-lint.json" },
        });
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/data1.yaml";
        const level   = SEVERITY.INFO;
        const options = { schema: "FAILSAFE_SCHEMA" };

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "yaml-lint",
                message:   "incomplete explicit mapping pair; a key node" +
                           " is missed; or followed by a non-tabulated" +
                           " empty line",
                locations: [{ line: 1, column: 1 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/data2.yml";
        const level   = SEVERITY.ERROR;
        const options = null;

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/data3.yml";
        const level   = SEVERITY.FATAL;
        const options = null;

        const notices = await linter.wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
