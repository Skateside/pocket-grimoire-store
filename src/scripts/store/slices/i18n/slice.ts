import type {
    II18nData,
    II18nModifiers,
    II18nAccessors,
    II18nEvents,
    II18nHelpers,
} from "./types";
import Slice from "../../Slice";

export default new Slice<
    II18nData,
    II18nModifiers,
    II18nAccessors,
    II18nEvents,
    II18nHelpers
>({
    name: "i18n",
    initialState: {},
    modifiers: {},
    accessors: {
        trans({ state }, key, defaultResult) {

            if (Object.hasOwn(state, key)) {
                return state[key];
            }

            return defaultResult ?? key;

        }
    },
    helpers: {},
    save: false,
    load(initialState) {
        return {
            ...initialState,
            ...window.PG.i18n,
        };
    },
});
