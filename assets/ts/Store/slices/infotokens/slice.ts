import type {
    IInfoToken,
    IInfoModifiers,
    IInfoAccessors,
    IInfoEvents,
} from "./types";
import {
    CannotChangeOfficialIntoTokenError,
} from "./errors";
import Slice from "../../Slice";
import {
    randomId,
} from "../../../utilities/strings";
import "../../../lib/lib.object-groupby"; // TEMP

const getCustomToken = (state: IInfoToken[], id: IInfoToken["id"]) => {

    const index = state.findIndex((token) => token.id === id);

    if (index < 0) {
        return { index };
    }

    const token = state[index];

    if (token.type === "official") {
        throw new CannotChangeOfficialIntoTokenError(id);
    }

    return {
        index,
        token,
    };

};

const slice = new Slice<
// export default new Slice<
    IInfoToken[],
    IInfoModifiers,
    IInfoAccessors,
    IInfoEvents
>({
    name: "info-tokens",
    initialState: [],
    modifiers: {
        add({ payload, state, trigger }) {

            const infoToken: IInfoToken = {
                id: randomId("cit-"),
                text: payload,
                colour: "grey",
                type: "custom",
            };

            state.push(infoToken);
            trigger("add", infoToken);

            return state;

        },
        update({ payload, state, trigger }) {

            const { token } = getCustomToken(state, payload.id);

            if (!token) {
                return;
            }

            Object.assign(token, payload);
            trigger("update", token);

            return state;

        },
        remove({ payload, state, trigger }) {

            const { index } = getCustomToken(state, payload);

            if (index < 0) {
                return;
            }

            state.splice(index, 1);
            trigger("remove", payload);

            return state;

        },
    },
    accessors: {
        getByType({ state }) {
            return Object.groupBy(state, ({ type }) => type);
        },
    },
    save(data) {
        return data.filter(({ type }) => type === "custom");
    },
    load(initialState, data) {
        return [
            ...initialState,
            // ...(window as any).PG.infos,
            ...data,
        ];
    }
});

//*
slice.events.on("add", (token, { cancel, stop }) => {});
slice.events.on("update", (token) => {});
slice.events.on("remove", (id) => {});
slice.events.on("updateStore", (state) => {});
// slice.actions.add((payload) => { return null; });
slice.actions.add("Lorem ipsum **dolor** sit amet");
slice.actions.update({ id: "", text: "" });
export default slice;
//*/
