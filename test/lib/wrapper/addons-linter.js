import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/addons-linter.js";

const DATA_DIR = "test/data/lib/wrapper/addons-linter";

describe("lib/wrapper/addons-linter.js", function () {
    it("wrapper()", async function () {
        const file  = DATA_DIR + "/addon.xpi";
        const level = SEVERITY.INFO;

        const notices = await wrapper(file, level);
        assert.deepStrictEqual(notices, []);
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/addon1/";
        const level = SEVERITY.WARN;

        const notices = await wrapper(file, level);
        assert.deepStrictEqual(notices, [
            {
                file:      file + "manifest.json",
                linter:    "addons-linter",
                rule:      "MANIFEST_FIELD_REQUIRED",
                severity:  SEVERITY.ERROR,
                message:   `"/name" is a required property`,
                locations: [],
            }, {
                file:      file + "manifest.json",
                linter:    "addons-linter",
                rule:      "MANIFEST_PERMISSIONS",
                severity:  SEVERITY.WARN,
                message:   `/permissions: Unknown permissions "god mode" at 0.`,
                locations: [],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/addon2/";
        const level = SEVERITY.INFO;

        const notices = await wrapper(file, level);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "addons-linter",
                rule:      "TYPE_NO_MANIFEST_JSON",
                severity:  SEVERITY.ERROR,
                message:   "manifest.json was not found",
                locations: [],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file  = DATA_DIR + "/addon2/";
        const level = SEVERITY.FATAL;

        const notices = await wrapper(file, level);
        assert.deepStrictEqual(notices, []);
    });
});
