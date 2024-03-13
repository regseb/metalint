/**
 * @license MIT
 * @author Sébastien Règne
 */

import type Formatter from "../core/formatter/formatter.js";
import type Level from "./level.d.ts";

export type TypeofFormatter = new (
    level: Level,
    options: Record<string, unknown>,
) => Formatter;
export default TypeofFormatter;
