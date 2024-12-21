/**
 * Removes all the duplicates from the given array.
 *
 * @param array Array whose duplicate entries should be removed.
 * @returns De-duplicated array.
 */
export function unique<T extends any>(array: T[]) {
    return [...new Set<T>(array)];
}
