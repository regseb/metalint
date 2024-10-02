/**
 * @license MIT
 * @author Sébastien Règne
 */

/**
 * @import { PartialStrykerOptions } from "@stryker-mutator/api/core"
 */

/**
 * @type {PartialStrykerOptions}
 */
export default {
    disableTypeChecks: false,
    incremental: true,
    incrementalFile: ".stryker/incremental.json",
    ignoreStatic: true,
    mutate: ["src/core/**/*.js"],
    reporters: ["dots", "clear-text"],
    tempDirName: ".stryker/tmp/",
    testRunner: "tap",
    tap: {
        testFiles: ["test/unit/**/*.js"],
    },
};
