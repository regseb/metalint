/**
 * @license MIT
 * @author Sébastien Règne
 */

export type Location = {
    line: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
};
export default Location;
