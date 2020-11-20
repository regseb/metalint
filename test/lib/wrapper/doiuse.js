import assert from "assert";
import { SEVERITY } from "../../../lib/severity.js";
import { wrapper } from "../../../lib/wrapper/doiuse.js";

const DATA_DIR = "test/data/lib/wrapper/doiuse";

describe("lib/wrapper/doiuse.js", function () {
    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style1.css";
        const level   = SEVERITY.INFO;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "doiuse",
                rule:      "border-radius",
                severity:  SEVERITY.ERROR,
                message:   "CSS3 Border-radius (rounded corners) not" +
                           " supported by: Opera Mini (all)",
                locations: [{ line: 2, column: 1 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style2.css";
        const level   = SEVERITY.INFO;
        const options = { browser: "ie >= 9, > 1%, last 2 versions" };

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, [
            {
                file,
                linter:    "doiuse",
                rule:      "background-img-opts",
                severity:  SEVERITY.ERROR,
                message:   "CSS3 Background-image options only partially" +
                           " supported by: Opera Mini (all)",
                locations: [{ line: 2, column: 1 }],
            },
        ]);
    });

    it("wrapper()", async function () {
        const file    = DATA_DIR + "/style3.css";
        const level   = SEVERITY.FATAL;
        const options = {};

        const notices = await wrapper(file, level, options);
        assert.deepStrictEqual(notices, []);
    });
});
