/**
 * @license MIT
 * @author Sébastien Règne
 */

import type Levels from "../core/levels.js";

export type Level = (typeof Levels)[keyof typeof Levels];
export default Level;
