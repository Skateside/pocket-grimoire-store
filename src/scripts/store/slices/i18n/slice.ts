import type {
    II18nData,
    II18nModifiers,
    II18nAccessors,
    II18nEvents,
    II18nMethods,
} from "./types";
import Slice from "../../Slice";

export default new Slice<
    II18nData,
    II18nModifiers,
    II18nAccessors,
    II18nEvents,
    II18nMethods
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
    methods: {},
    save: false,
    load(initialState) {
        return {
            ...initialState,
            ...window.PG.i18n,
        };
    },
});
