import type {
    IObserver,
} from "../../types/classes";
import type {
    IStorage,
} from "./storage";
import type {
    ISlice,
} from "./slice";
import type {
    II18nData,
    II18nModifiers,
    II18nAccessors,
    II18nEvents,
    II18nHelpers,
} from "../slices/i18n/types";
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

export type IStoreSettings = {
    observer: IObserver,
    storage: IStorage,
};

// It would be nice if this could be done automatically, but doing this manually
// allows TypeScript to work across modules.

export type IStoreSlices = {
    "i18n": ISlice<II18nData, II18nModifiers, II18nAccessors, II18nEvents, II18nHelpers>,
    "info-tokens": ISlice<IInfoData, IInfoModifiers, IInfoAccessors, IInfoEvents, IInfoHelpers>,
    "roles": ISlice<IRoleData, IRoleModifiers, IRoleAccessors, IRoleEvents, IRoleHelpers>,
};
