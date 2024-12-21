import {
    IStoreLookup,
} from "../store/types/store";

export type IAppLookup = <K extends keyof IStoreLookup>(key: K) => IStoreLookup[K];
