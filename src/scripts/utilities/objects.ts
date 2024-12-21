import type {
    IObjectDiff,
} from "../types/utilities";
import {
    AnyObject,
} from "../types/lib";

/**
 * Checks to see if the given object is iterable. This might mean an array, but
 * could also mean something like a NodeList.
 * 
 * @param source Source to check.
 * @returns Whether or not the source object is iterable.
 */
export const isIterable = <T>(source: unknown): source is T[] => (
    isNonNullObject(source)
    && typeof (source as T[])[Symbol.iterator] === "function"
)

/**
 * Checks to see if the keys of the keys of the two given objects match. The
 * keys don't necessarily need to be in the same order.
 * 
 * @param source One object to test.
 * @param check Another object to test.
 * @returns Whether or not the keys match.
 */
export const keysMatch = (
    source: AnyObject,
    check: AnyObject,
) => {

    const sourceKeys = Object.keys(source).sort();
    const checkKeys = Object.keys(check).sort();

    return (
        sourceKeys.length === checkKeys.length
        && sourceKeys.every((key, index) => checkKeys[index] === key)
    );

}

/**
 * Checks to see if the two objects "look alike." Because objects are passed by
 * reference, two objects that contain the same keys and values aren't the same
 * but they "look alike."
 * 
 * Unlike {@link matches}, this function will compare object properties to make
 * sure that they "look alike" as well as making sure that all keys in one
 * object appears in both.
 * 
 * @param source Source object to check.
 * @param check Object to compare.
 * @returns Whether or not the two objects look alike.
 */
export const looksLike = (source: unknown, check: unknown): boolean => {

    // First check: are they the same or do they pass `Object.is()`?
    if (source === check || Object.is(source, check)) {
        return true;
    }

    // Second check: are they both iterable, have the same length, and contain
    // the same items in the same order with the same gaps (if any)?
    if (isIterable(source) && isIterable(check)) {

        return (
            source.length === check.length
            && keysMatch(source, check)
            && Array.prototype.every.call(
                source,
                (item: any, index: number) => looksLike(item, check[index]),
            )
        );

    }

    // Third check: are they both objects that contain the same properties and
    // those properties contain values the look the same?
    if (isNonNullObject(source) && isNonNullObject(check)) {

        return (
            keysMatch(source, check)
            && Object.entries(source).every(([property, value]) => (
                looksLike(value, check[property])
            ))
        );

    }

    // Finally: these two items do not look the same.
    return false;

}

/**
 * Checks to see if the given object is an object and not `null`. Be aware that
 * an array would return `true` here.
 * 
 * @param object Object to check.
 * @returns Whether or not the object is non-nul.
 */
export const isNonNullObject = (
    object: unknown,
): object is AnyObject => {
    return typeof object === "object" && object !== null;
}

/**
 * Checks to see if the object is empty - i.e. it has no keys.
 * 
 * @param object Object to test.
 * @returns Whether or not the object is empty.
 */
export const isEmptyObject = (
    object: AnyObject,
): object is {} => {
    return Object.keys(object).length === 0;
}

/**
 * Checks to see if all the keys in `check` also appear in `source` and contain
 * the same values.
 * 
 * This check is faster than {@link looksLike} but is a shallow check and if a
 * key appears in `check` but not `source` then this function will still return
 * `true`.
 * 
 * @param source Source object to check.
 * @param check Check against the source.
 * @returns Whether or not `source` matches `check`.
 */
export const matches = (
    source: AnyObject | null,
    check: AnyObject | null,
) => {

    if (!source || !check) {
        return (!source && !check);
    }

    return Object.entries(source).every(([key, value]) => check[key] === value);

}

/**
 * Gets an object describing the differences between the two objects. Each
 * property in the returned object will have a type ("new" means that the
 * property was added, "update" means that the value was changed, "remove"
 * means that the property was removed, and "children" means that the value is
 * an object and at least one of the value's properties has changed) and the
 * value itself.
 * 
 * @param source Source object.
 * @param update Updated object.
 * @returns Information about any changes.
 */
export const difference = (
    source: AnyObject,
    update: AnyObject,
) => {

    const diff: Record<string, IObjectDiff> = Object.create(null);

    Object.keys(source).forEach((key) => {

        if (!Object.hasOwn(update, key)) {
            diff[key] = { type: "remove" };
        }

    });

    Object.entries(update).forEach(([key, value]) => {
        
        if (!Object.hasOwn(source, key)) {
            diff[key] = { value, type: "new" };
            return;
        }

        const item = source[key];
        const isItemObject = isNonNullObject(item);
        const isValueObject = isNonNullObject(value);

        if (
            item === value
            || (
                isItemObject
                && isValueObject
                && matches(item, value)
                && matches(value, item)
            )
        ) {
            return;
        }

        if (isItemObject && isValueObject) {

            const childDiff = difference(item, value);

            if (!isEmptyObject(childDiff)) {
                diff[key] = { value: childDiff, type: "children" };
            }

            return;

        }

        diff[key] = { value, type: "update" };

    });

    return diff;

}

/**
 * Returns a version of `source` that has been updated according to the
 * information in `difference` - that information can be generated using the
 * {@link difference} function.
 * 
 * @param source Source object to update.
 * @param difference The changes to make.
 * @returns A version of `source` with the changes applied.
 */
export const update = <T extends AnyObject = AnyObject>(
    source: T,
    difference: Record<string, IObjectDiff>,
): Partial<T> & AnyObject => {

    const updated = structuredClone(source) as Partial<T> & AnyObject;

    Object.entries(difference).forEach(([key, diff]) => {

        switch (diff.type) {

        case "remove":
            delete updated[key];
            return;
        
        case "children":

            if (!Object.hasOwn(updated, key)) {
                (updated as any)[key] = {};
            }

            (updated as any)[key] = update(updated[key], diff.value);
            return;
        
        case "new":
        case "update":
            (updated as any)[key] = diff.value;
            return;

        }

    });

    return updated;

}
