import type {
    IInfoData,
    IInfoModifiers,
    IInfoAccessors,
    IInfoEvents,
    IInfoHelpers,
} from "../slices/infotokens/types";
import type {
    IRoleData,
    IRoleModifiers,
    IRoleAccessors,
    IRoleEvents,
    IRoleHelpers,
} from "../slices/roles/types";
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
    "info-tokens": Slice<IInfoData, IInfoModifiers, IInfoAccessors, IInfoEvents, IInfoHelpers>,
    "roles": Slice<IRoleData, IRoleModifiers, IRoleAccessors, IRoleEvents, IRoleHelpers>,
};
