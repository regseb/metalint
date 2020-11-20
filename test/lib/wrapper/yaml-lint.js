import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/yaml-lint.js";

const DATA_DIR = "test/data/lib/wrapper/yaml-lint";

describe("lib/wrapper/yaml-lint.js", function () {
    it("wrapper()", async function () {
        const file    = DATA_DIR + "/data1.yaml";
        const level   = SEVERITY.INFO;
        const options = { schema: "FAILSAFE_SCHEMA" };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "yaml-lint",
                rule:      null,
                severity:  SEVERITY.ERROR,
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

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/data3.yml";
        const level   = SEVERITY.FATAL;
        const options = null;

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
