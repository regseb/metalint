import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/htmlhint.js";

const DATA_DIR = "test/data/lib/wrapper/htmlhint";

describe("lib/wrapper/htmlhint.js", function () {
    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index1.html";
        const level   = SEVERITY.INFO;
        const options = null;

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index2.html";
        const level   = SEVERITY.WARN;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "htmlhint",
                rule:      "doctype-first",
                severity:  SEVERITY.ERROR,
                message:   "Doctype must be declared first.",
                locations: [{ line: 1, column: 1 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index3.html";
        const level   = SEVERITY.ERROR;
        const options = { "head-script-disabled": true };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/index.tex";
        const level   = SEVERITY.FATAL;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
