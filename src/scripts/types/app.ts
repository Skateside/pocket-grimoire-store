import {
    IStoreSlices,
} from "../store/types/store";

export type IAppGetSlice = <K extends keyof IStoreSlices>(key: K) => IStoreSlices[K];
