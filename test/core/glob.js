import assert from "node:assert";
import { fileURLToPath } from "node:url";
import mock from "mock-fs";
import sinon from "sinon";
import glob from "../../src/core/glob.js";

if (undefined === import.meta.resolve) {

    /**
     * Résous un chemin relatif à partir du module.
     *
     * @param {string} specifier Le chemin relatif vers un fichier ou un
     *                           répertoire.
     * @returns {Promise<string>} Une promesse contenant le chemin absolue vers
     *                            le fichier ou le répertoire.
     * @see https://nodejs.org/api/esm.html#importmetaresolvespecifier-parent
     */
    import.meta.resolve = (specifier) => {
        return Promise.resolve(fileURLToPath(new URL(specifier,
                                                     import.meta.url).href));
    };
}

describe("src/core/glob.js", function () {
    describe("test()", function () {
        it("test([])", async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = [];
            const root = await import.meta.resolve(".");
            const matched = glob.test(
                "src/core/index.js", patterns, root, false,
            );
            assert.strictEqual(matched, false);

            assert.strictEqual(stub.callCount, 1);
        });

        it(`test(["**"])̀`, async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = ["**"];
            const root = await import.meta.resolve(".");
            let matched = glob.test(
                "src/core/index.min.js", patterns, root, false,
            );
            assert.strictEqual(matched, true);
            matched = glob.test("src/", patterns, root, true);
            assert.strictEqual(matched, true);

            assert.strictEqual(stub.callCount, 2);
        });

        it(`test(["**/*.js"])`, async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = ["**/*.js"];
            const root = await import.meta.resolve(".");
            let matched = glob.test(
                "src/core/index.min.js", patterns, root, false,
            );
            assert.strictEqual(matched, true);
            matched = glob.test("index.min.js", patterns, root, false);
            assert.strictEqual(matched, true);
            matched = glob.test("src/core/index.min.js/", patterns, root, true);
            assert.strictEqual(matched, true);
            matched = glob.test("src/core/", patterns, root, true);
            assert.strictEqual(matched, false);
            matched = glob.test(
                "src/core.js/index.html", patterns, root, false,
            );
            assert.strictEqual(matched, false);

            assert.strictEqual(stub.callCount, 5);
        });

        it(`test(["!**/*~", "**"])̀`, async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = ["!**/*~", "**"];
            const root = await import.meta.resolve(".");
            let matched = glob.test(
                "src/core/index.min.js", patterns, root, false,
            );
            assert.strictEqual(matched, true);
            matched = glob.test(
                "src/core/index~.min.js", patterns, root, false,
            );
            assert.strictEqual(matched, true);
            matched = glob.test(
                "src/core/index.min.js~", patterns, root, false,
            );
            assert.strictEqual(matched, false);
            matched = glob.test(
                "src/core/index.js~/i.html", patterns, root, false,
            );
            assert.strictEqual(matched, false);

            assert.strictEqual(stub.callCount, 4);
        });

        it(`test(["/**/*.md"])`, async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = ["/**/*.md"];
            const root = await import.meta.resolve(".");
            let matched = glob.test("foo/bar.md", patterns, root, false);
            assert.strictEqual(matched, true);
            matched = glob.test("foo.md", patterns, root, false);
            assert.strictEqual(matched, true);
            matched = glob.test("foo.txt", patterns, root, false);
            assert.strictEqual(matched, false);

            assert.strictEqual(stub.callCount, 3);
        });

        it(`test(["/*/*.md"])`, async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = ["/*/*.md"];
            const root = await import.meta.resolve(".");
            let matched = glob.test("foo/bar.md", patterns, root, false);
            assert.strictEqual(matched, true);
            matched = glob.test("foo.md", patterns, root, false);
            assert.strictEqual(matched, false);
            matched = glob.test("foo/bar.txt", patterns, root, false);
            assert.strictEqual(matched, false);

            assert.strictEqual(stub.callCount, 3);
        });

        it(`test(["foo/**"])`, async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = ["foo/**"];
            const root = await import.meta.resolve(".");
            let matched = glob.test("foo", patterns, root, true);
            assert.strictEqual(matched, true);
            matched = glob.test("foo/", patterns, root, true);
            assert.strictEqual(matched, true);
            matched = glob.test("foo/bar.js", patterns, root, false);
            assert.strictEqual(matched, true);
            matched = glob.test("foobar/baz.js", patterns, root, false);
            assert.strictEqual(matched, false);

            assert.strictEqual(stub.callCount, 4);
        });

        it(`test(["foo?bar"])`, async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = ["foo?bar"];
            const root = await import.meta.resolve(".");
            let matched = glob.test("foo.bar", patterns, root, false);
            assert.strictEqual(matched, true);
            matched = glob.test("foo/bar", patterns, root, true);
            assert.strictEqual(matched, false);

            assert.strictEqual(stub.callCount, 2);
        });

        it(`test(["foo[123].js"])`, async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = ["foo[123].js"];
            const root = await import.meta.resolve(".");
            let matched = glob.test("foo1.js", patterns, root, false);
            assert.strictEqual(matched, true);
            matched = glob.test("foo2.js", patterns, root, false);
            assert.strictEqual(matched, true);
            matched = glob.test("foo3.js", patterns, root, false);
            assert.strictEqual(matched, true);
            matched = glob.test("foo4.js", patterns, root, false);
            assert.strictEqual(matched, false);
            matched = glob.test("foo.js", patterns, root, false);
            assert.strictEqual(matched, false);

            assert.strictEqual(stub.callCount, 5);
        });

        it(`test(["!foo/", "**"])`, async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = ["!foo/", "**"];
            const root = await import.meta.resolve(".");
            let matched = glob.test("bar/baz.js", patterns, root, false);
            assert.strictEqual(matched, true);
            matched = glob.test("foo/", patterns, root, true);
            assert.strictEqual(matched, false);
            matched = glob.test("foo/bar.js", patterns, root, false);
            assert.strictEqual(matched, false);

            assert.strictEqual(stub.callCount, 3);
        });

        it(`test(["foo/"])`, async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            const patterns = ["foo/"];
            const root = await import.meta.resolve(".");
            let matched = glob.test("foo/", patterns, root, true);
            assert.strictEqual(matched, true);
            matched = glob.test("foo", patterns, root, true);
            assert.strictEqual(matched, true);
            matched = glob.test("foo", patterns, root, false);
            assert.strictEqual(matched, false);

            assert.strictEqual(stub.callCount, 3);
        });

        it("test() throws", async function () {
            const stub = sinon.stub(process, "cwd")
                              .returns(await import.meta.resolve("."));

            assert.throws(() => glob.test("", ["/**foo"], "", false), {
                name:    "Error",
                message: "/**foo: '**' not followed by a slash.",
            });

            assert.throws(() => glob.test("", ["foo**"], "", false), {
                name:    "Error",
                message: "foo**: '**' not preceded by a slash.",
            });

            assert.throws(() => glob.test("", ["fo[ou"], "", false), {
                name:    "Error",
                message: "fo[ou: ']' missing.",
            });

            assert.strictEqual(stub.callCount, 0);
        });
    });

    describe("walk()", function () {
        it("walk()", async function () {
            mock({
                "/foo": {
                    "bar.js": "",
                    baz:      {
                        "qux.js":  "",
                        "quux.js": "",
                    },
                },
            });
            const stub = sinon.stub(process, "cwd").returns("/foo");

            let files = await glob.walk([], ["**/bar.js"], "/");
            assert.deepStrictEqual(files, ["bar.js"]);

            files = await glob.walk([], ["**/bar.js"], "/foo");
            assert.deepStrictEqual(files, ["bar.js"]);

            files = await glob.walk(["baz"], ["**/qux.js"], "/foo");
            assert.deepStrictEqual(files, ["baz/qux.js"]);

            files = await glob.walk(["baz/qux.js"], ["**/quux.js"], "/foo");
            assert.deepStrictEqual(files, []);

            files = await glob.walk(["baz/qux.js"], ["!baz"], "/foo");
            assert.deepStrictEqual(files, []);

            assert.strictEqual(stub.callCount, 55);
        });
    });
});
