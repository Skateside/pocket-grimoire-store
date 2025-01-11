import type {
    AnyObject,
} from "../../types/lib";
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

export type IStore = {
    addSlice(slice: ISlice): void,
    getSlice(name: string): ISlice,
    getState(name: string): any,
    getFullState(): AnyObject,
    save(): void,
    load(): void,
    run(): void,
};

export type IStoreSettings = {
    observer: IObserver,
    storage: IStorage,
};

// It would be nice if this could be done automatically, but doing this manually
// allows TypeScript to work across modules.

export type II18nSlice = ISlice<II18nData, II18nModifiers, II18nAccessors, II18nEvents, II18nHelpers>;
export type IInfoTokensSlice = ISlice<IInfoData, IInfoModifiers, IInfoAccessors, IInfoEvents, IInfoHelpers>;
export type IRolesSlice = ISlice<IRoleData, IRoleModifiers, IRoleAccessors, IRoleEvents, IRoleHelpers>;

export type IStoreSlices = {
    "i18n": II18nSlice,
    "info-tokens": IInfoTokensSlice,
    "roles": IRolesSlice,
};
