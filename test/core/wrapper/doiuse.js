import assert from "node:assert";
import mock from "mock-fs";
import SEVERITY from "../../../src/core/severity.js";
import { wrapper } from "../../../src/core/wrapper/doiuse.js";

describe("src/core/wrapper/doiuse.js", function () {
    describe("wrapper()", function () {
        it("should ignore with FATAL level", async function () {
            const file    = "";
            const level   = SEVERITY.FATAL;
            const options = null;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, []);
        });

        it("should use default options", async function () {
            // Ajouter un saut de ligne à la fin, sinon doiuse affiche le texte
            // suivant dans la console : "[css-tokenize] unfinished business
            // [ [ 'root' ] ]".
            mock({ "foo.css": "button { border-radius: 10px; }\n" });

            const file    = "foo.css";
            const level   = SEVERITY.INFO;
            const options = null;

            const notices = await wrapper(file, level, options);
            assert.deepStrictEqual(notices, [
                {
                    file,
                    linter:    "doiuse",
                    rule:      "border-radius",
                    severity:  SEVERITY.ERROR,
                    message:   "CSS3 Border-radius (rounded corners) not" +
                               " supported by: Opera Mini (all)",
                    locations: [{ line: 1, column: 1 }],
                },
            ]);
        });

        it("should return notices", async function () {
            // Ajouter un saut de ligne à la fin, sinon doiuse affiche le texte
            // suivant dans la console : "[css-tokenize] unfinished business
            // [ [ 'root' ] ]".
            mock({ "foo.css": "div { background-size: cover; }\n" });

            const file    = "foo.css";
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
                    locations: [{ line: 1, column: 1 }],
                },
            ]);
        });
    });
});
