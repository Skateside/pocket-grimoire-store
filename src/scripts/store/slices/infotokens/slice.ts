import type {
    IInfoToken,
    IInfoData,
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

// const slice = new Slice<
export default new Slice<
    IInfoData,
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
    load(initialState, data = []) {
        return [
            ...initialState,
            ...(window as any).PG.infoTokens,
            ...data,
        ];
    }
});

const getCustomToken = (state: IInfoData, id: IInfoToken["id"]) => {

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

/*
// slice.events.on("add", (token, { cancel, stop }) => {});
// slice.events.on("update", (token) => {});
// slice.events.on("remove", (id) => {});
// slice.events.on("updateStore", (state) => {});
// // slice.actions.add((payload) => { return null; });
// slice.actions.add("Lorem ipsum **dolor** sit amet");
// slice.actions.update({ id: "", text: "" });
// const types = slice.references.getByType();
// const token = slice.references.getToken("");
export default slice;
//*/
