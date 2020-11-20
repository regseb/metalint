import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/standard.js";

const DATA_DIR = "test/data/lib/wrapper/standard";

describe("lib/wrapper/standard.js", function () {
    it("wrapper()", async function () {
        const file  = DATA_DIR + "/script.js";
        const level = SEVERITY.ERROR;

        const notices = await wrapper(file, level);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "standard",
                rule:      "no-unused-vars",
                message:   "'text' is assigned a value but never used.",
                locations: [{ line: 1, column: 7 }],
            }, {
                file,
                linter:    "standard",
                rule:      "quotes",
                message:   "Strings must use singlequote.",
                locations: [{ line: 1, column: 14 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/data.xml";
        const level = SEVERITY.FATAL;

        const notices = await wrapper(file, level);
        assert.deepStrictEqual(notices, []);
    });
});
