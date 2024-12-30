import type {
    IInfoData,
    IInfoModifiers,
    IInfoAccessors,
    IInfoEvents,
} from "../slices/infotokens/types";
import Slice from "../Slice";
import Observer from "../../Observer";
import Storage from "../Storage";

export type IStoreSettings = {
    observer: Observer,
    storage: Storage,
};

// It would be nice if this could be done automatically, but doing this manually
// allows TypeScript to work across modules.

export type IStoreSlices = {
    "info-tokens": Slice<IInfoData, IInfoModifiers, IInfoAccessors, IInfoEvents>,
};
