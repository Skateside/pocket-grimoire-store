import {
    unique,
} from "./arrays";
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

/**
 * Takes a space-separated collection of words and returns a de-duplicated array
 * of those words. If the given `text` is blank, an empty array is returned.
 *
 * @param text Text whose words should be returned.
 * @returns Array of unique words.
 */
export function wordlist<TList = string>(text: string) {

    const trimmed = text.trim();

    return (
        trimmed
        ? unique(trimmed.split(/\s+/))
        : []
    ) as TList[];

}
