import {
    CannotFindElementError,
    MissingRootError,
} from "../errors";
import {
    memoise,
} from "./functions";

/**
 * Finds the element which matches the given CSS selector, optionally limited to
 * being a child of the given `root`. If the element is not found, a
 * `CannotFindElementError` is thrown.
 *
 * @param selector CSS selector to identify the element.
 * @param root Optional root element. Defaults to `document`.
 * @returns The found element.
 */
export function findOrDie<T extends HTMLElement>(
    selector: string,
    root: HTMLElement | Document | null = document,
) {

    if (!root) {
        throw new MissingRootError();
    }

    const element = root.querySelector<T>(selector);

    if (!element) {
        throw new CannotFindElementError(selector);
    }

    return element;

}

/**
 * A cached version of {@link findOrDie}.
 *
 * @param selector CSS selector to identify the element.
 * @param root Optional root element. Defaults to `document`.
 * @returns The found element.
 */
export const findOrDieCached = memoise(findOrDie);

/**
 * Updates the given `content` element's children based on the given updates.
 * The updates are an object of a CSS selector to a function which takes a match
 * and performs an update.
 *
 * @param content Content element to update.
 * @param updates Updater functions.
 *
 * @example
 * const div = document.querySelector("div");
 * div;
 * // <div>
 * //     <span class="first-letter">Alpha</span>
 * //     <em class="first-letter">Bravo</em>
 * //     <span class="last-letter">Charlie</span>
 * // </div>
 * updateChildren(div, {
 *     ".first-letter"(element) {
 *         element.textContent = element.textContent.slice(0, 1);
 *     },
 *     ".last-letter"(element) {
 *         element.textContent = element.textContent.slice(1);
 *     },
 * });
 * div;
 * // <div>
 * //     <span class="first-letter">A</span>
 * //     <em class="first-letter">B</em>
 * //     <span class="last-letter">e</span>
 * // </div>
 */
export function updateChildren(
    content: HTMLElement | DocumentFragment,
    updates: Record<string, (element: HTMLElement) => void>
) {

    Object.entries(updates).forEach(([selector, updater]) => {

        content.querySelectorAll<HTMLElement>(selector).forEach((element) => {
            updater(element);
        });

    });

}

/**
 * Renders the given template and populates its contents (see
 * {@link updateChildren}).
 *
 * @param selector CSS selector identifying the `<template>` element.
 * @param populates Updates for the template.
 * @returns A `DocumentFragment` containing the rendered template.
 */
export function renderTemplate(
    selector: string,
    populates: Record<string, (element: HTMLElement) => void>
) {

    const template = findOrDieCached<HTMLTemplateElement>(selector);
    const clone = template.content.cloneNode(true) as DocumentFragment;

    updateChildren(clone, populates);

    return clone;

}
