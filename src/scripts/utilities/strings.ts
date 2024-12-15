import {
    random,
} from "./numbers";

/**
 * Generates a random ID containing letters and numbers.
 *
 * @param prefix Optional prefix for the ID.
 * @returns A random id.
 */
export function randomId(prefix = "") {

    const rand = random().toString(16).slice(2);
    const date = Date.now().toString(36);

    return `${prefix}${rand}${date}`;

}
