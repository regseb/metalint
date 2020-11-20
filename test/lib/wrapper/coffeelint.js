import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/coffeelint.js";

const DATA_DIR = "test/data/lib/wrapper/coffeelint";

describe("lib/wrapper/coffeelint.js", function () {
    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script1.coffee";
        const level   = SEVERITY.INFO;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script2.coffee";
        const level   = SEVERITY.WARN;
        /* eslint-disable camelcase */
        const options = {
            no_tabs:                 { level: "error" },
            prefer_english_operator: { level: "warn" },
        };
        /* eslint-enable camelcase */

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "coffeelint",
                rule:      "prefer_english_operator",
                severity:  SEVERITY.WARN,
                message:   "Don't use &&, ||, ==, !=, or !",
                locations: [{ line: 2 }],
            }, {
                file,
                linter:    "coffeelint",
                rule:      "no_tabs",
                severity:  SEVERITY.ERROR,
                message:   "Line contains tab indentation",
                locations: [{ line: 2 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script3.coffee";
        const level   = SEVERITY.ERROR;
        // eslint-disable-next-line camelcase
        const options = { prefer_english_operator: { level: "warn" } };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/script4.coffee";
        const level   = SEVERITY.FATAL;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
