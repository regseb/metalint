/**
 * @module
 * @license MIT
 * @author Sébastien Règne
 */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
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
        return Promise.resolve(
            fileURLToPath(new URL(specifier, import.meta.url).href),
        );
    };
}

describe("src/core/glob.js", function () {
    describe("normalize()", function () {
        it("should normalize file", async function () {
            const stub = sinon.stub(fs, "lstat").resolves({
                isDirectory() {
                    return false;
                },
            });

            const normalized = await glob.normalize("foo");
            assert.equal(normalized, "foo");

            assert.equal(stub.callCount, 1);
            assert.deepEqual(stub.firstCall.args, ["foo"]);
        });

        it("should normalize directory", async function () {
            const stub = sinon.stub(fs, "lstat").resolves({
                isDirectory() {
                    return true;
                },
            });

            const normalized = await glob.normalize("foo");
            assert.equal(normalized, "foo/");

            assert.equal(stub.callCount, 1);
            assert.deepEqual(stub.firstCall.args, ["foo"]);
        });
    });

    describe("test()", function () {
        it("should reject all file with no pattern", async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = [];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("./", patterns, root), false);
            assert.equal(glob.test("foo/", patterns, root), false);
            assert.equal(glob.test("bar", patterns, root), false);
            assert.equal(glob.test("baz/qux/", patterns, root), false);
            assert.equal(glob.test("baz/quux", patterns, root), false);
        });

        it("should accept only root", async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["/"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("./", patterns, root), true);
            assert.equal(glob.test("foo/", patterns, root), false);
            assert.equal(glob.test("bar", patterns, root), false);
            assert.equal(glob.test("baz/qux/", patterns, root), false);
            assert.equal(glob.test("baz/quux", patterns, root), false);
        });

        it("should accept only files", async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["*"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("./", patterns, root), false);
            assert.equal(glob.test("foo/", patterns, root), false);
            assert.equal(glob.test("bar", patterns, root), true);
            assert.equal(glob.test("baz/qux/", patterns, root), false);
            assert.equal(glob.test("baz/quux", patterns, root), true);
        });

        it("should accept only directories", async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["*/"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("./", patterns, root), false);
            assert.equal(glob.test("foo/", patterns, root), true);
            assert.equal(glob.test("bar", patterns, root), false);
            assert.equal(glob.test("baz/qux/", patterns, root), true);
            assert.equal(glob.test("baz/quux", patterns, root), false);
        });

        it("should accept only files in first level", async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["/*"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("./", patterns, root), false);
            assert.equal(glob.test("foo/", patterns, root), false);
            assert.equal(glob.test("bar", patterns, root), true);
            assert.equal(glob.test("baz/qux/", patterns, root), false);
            assert.equal(glob.test("baz/quux", patterns, root), false);
        });

        it("should accept only directories in first level", async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["/*/"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("./", patterns, root), false);
            assert.equal(glob.test("foo/", patterns, root), true);
            assert.equal(glob.test("bar", patterns, root), false);
            assert.equal(glob.test("baz/qux/", patterns, root), false);
            assert.equal(glob.test("baz/quux", patterns, root), false);
        });

        it("should accept files in depth", async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["foo"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("foo", patterns, root), true);
            assert.equal(glob.test("bar", patterns, root), false);
            assert.equal(glob.test("baz/foo", patterns, root), true);
            assert.equal(glob.test("qux/quux/foo", patterns, root), true);
        });

        it(`should support "/**/"`, async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["/foo/**/bar"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("foobar", patterns, root), false);
            assert.equal(glob.test("foo/bar", patterns, root), true);
            assert.equal(glob.test("foo/baz", patterns, root), false);
            assert.equal(glob.test("foo/baz/bar", patterns, root), true);
            assert.equal(glob.test("foo/baz/qux", patterns, root), false);
            assert.equal(glob.test("foo/baz/qux/bar", patterns, root), true);
            assert.equal(glob.test("foo/baz/qux/quux", patterns, root), false);
        });

        it(`should support "/**"`, async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["/foo/**"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("foobar", patterns, root), false);
            assert.equal(glob.test("foo/bar", patterns, root), true);
            assert.equal(glob.test("foo/bar/baz", patterns, root), true);
        });

        it(`should support "?"`, async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["foo?bar"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("foobar", patterns, root), false);
            assert.equal(glob.test("fooXbar", patterns, root), true);
            assert.equal(glob.test("fooXXbar", patterns, root), false);
        });

        it(`should support "[]"`, async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["foo[12]"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("foo", patterns, root), false);
            assert.equal(glob.test("foo1", patterns, root), true);
            assert.equal(glob.test("foo2", patterns, root), true);
            assert.equal(glob.test("foo3", patterns, root), false);
            assert.equal(glob.test("foo12", patterns, root), false);
            assert.equal(glob.test("foo[", patterns, root), false);
            assert.equal(glob.test("foo[12]", patterns, root), false);
        });

        it("should reject file", async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["!foo", "**"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("foo", patterns, root), false);
            assert.equal(glob.test("foobar", patterns, root), true);
            assert.equal(glob.test("baz", patterns, root), true);
        });

        it("should reject all sub-files in directory", async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["!/foo/", "**"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("foo/", patterns, root), false);
            assert.equal(glob.test("foo/bar", patterns, root), false);
            assert.equal(glob.test("foo/baz/", patterns, root), false);
            assert.equal(glob.test("qux", patterns, root), true);
            assert.equal(glob.test("quux/", patterns, root), true);
            assert.equal(glob.test("corge/foo/", patterns, root), true);
        });

        it("should sanitize pattern", async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["foo("];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("foo", patterns, root), false);
            assert.equal(glob.test("foo(", patterns, root), true);
            assert.equal(glob.test("foo()", patterns, root), false);
        });

        it(`should sanitize pattern in "[]"`, async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["foo[)(]"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("foo", patterns, root), false);
            assert.equal(glob.test("foo(", patterns, root), true);
            assert.equal(glob.test("foo)", patterns, root), true);
            assert.equal(glob.test("foo()", patterns, root), false);
        });

        it(`should sanitize "!" when it isn't first`, async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            const patterns = ["foo!"];
            const root = await import.meta.resolve(".");
            assert.equal(glob.test("foo", patterns, root), false);
            assert.equal(glob.test("foo!", patterns, root), true);
            assert.equal(glob.test("foo!bar", patterns, root), false);
        });

        it(`should reject "**" not followed by a slash`, async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            assert.throws(() => glob.test("", ["/**foo"], ""), {
                name: "Error",
                message: "/**foo: '**' not followed by a slash.",
            });
        });

        it(`should reject "**" not preceded by a slash`, async function () {
            sinon.stub(process, "cwd").returns(await import.meta.resolve("."));

            assert.throws(() => glob.test("", ["foo**"], ""), {
                name: "Error",
                message: "foo**: '**' not preceded by a slash.",
            });
        });

        it(`should reject "[" not closed`, function () {
            assert.throws(() => glob.test("", ["foo[bar"], ""), {
                name: "Error",
                message: "foo[bar: ']' missing.",
            });
        });
    });

    describe("walk()", function () {
        it("should work", async function () {
            mock({
                "/foo": {
                    "bar.js": "",
                    baz: {
                        "qux.js": "",
                        "quux.js": "",
                    },
                },
            });
            sinon.stub(process, "cwd").returns("/foo");

            let files = await glob.walk([], ["**/bar.js"], "/");
            assert.deepEqual(files, ["bar.js"]);

            files = await glob.walk([], ["**/bar.js"], "/foo/");
            assert.deepEqual(files, ["bar.js"]);

            files = await glob.walk(["baz/"], ["**/qux.js"], "/foo/");
            assert.deepEqual(files, ["baz/qux.js"]);

            files = await glob.walk(["baz/qux.js"], ["**/quux.js"], "/foo/");
            assert.deepEqual(files, []);

            files = await glob.walk(["baz/"], ["!baz/", "**"], "/foo/");
            assert.deepEqual(files, []);
        });
    });
});
