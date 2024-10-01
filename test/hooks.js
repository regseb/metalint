/**
 * @license MIT
 * @author Sébastien Règne
 */

import sinon from "sinon";
import { restore } from "./utils/fake.js";

export const mochaHooks = {
    afterEach: async () => {
        sinon.restore();
        await restore();
    },
};
