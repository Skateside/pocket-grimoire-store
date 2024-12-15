/**
 * Generates a cryptographically random number between 0 and 1.
 *
 * @returns Random number.
 */
export function random() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0] / (2**32);
}
