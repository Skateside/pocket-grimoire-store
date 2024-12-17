import type {
    IObjectDiff,
} from "../types/utilities";
import {
    AnyObject,
} from "../types/lib";

export const isIterable = <T>(source: unknown): source is T[] => (
    isNonNullObject(source)
    && typeof (source as T[])[Symbol.iterator] === "function"
)

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

export const isNonNullObject = (
    object: unknown,
): object is AnyObject => {
    return typeof object === "object" && object !== null;
}

export const isEmptyObject = (
    object: AnyObject,
): object is {} => {
    return Object.keys(object).length === 0;
}

export const matches = (
    source: AnyObject | null,
    check: AnyObject | null,
) => {

    if (!source || !check) {
        return (!source && !check);
    }

    return Object.entries(source).every(([key, value]) => check[key] === value);

}

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
