/**
 * @license MIT
 * @author Sébastien Règne
 */

import type Severities from "../core/severities.js";

export type Severity = (typeof Severities)[keyof typeof Severities];
export default Severity;
