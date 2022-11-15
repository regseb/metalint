export default {
    testRunner: "mocha",
    ignoreStatic: true,
    mochaOptions: { config: "test/mocharc.json" },
    reporters: ["dots", "clear-text", "dashboard"],
};
