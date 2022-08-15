import mock from "mock-fs";
import sinon from "sinon";

export const mochaHooks = {
    afterEach: () => {
        mock.restore();
        sinon.restore();
    },
};