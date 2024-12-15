import type {
    IInfoToken,
    IInfoReducers,
    IInfoEvents,
} from "./types";
import Slice from "../../Slice";

// const slice = new Slice<
export default new Slice<
    IInfoToken[],
    IInfoReducers,
    IInfoEvents
>({
    name: "info-tokens",
    initialState: [],
    reducers: {
        add(state, { payload, trigger }) {
            trigger("add", { id: "", text: "", colour: "", type: "custom" });
            trigger("remove", { index: 0, id: "" });
        },
    },
    save(data) {
        return data.filter(({ type }) => type === "custom");
    },
    load(state, data) {
        return [
            ...state,
            ...data,
        ];
    }
});

/*
slice.events.on("add", (token, { cancel, stop }) => {});
slice.events.on("remove", ({ index, id }) => {});
slice.events.on("updateStore", (state) => {});
slice.actions.add((payload) => { return null; });
export default slice;
//*/
