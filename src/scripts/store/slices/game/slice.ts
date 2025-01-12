import type {
    IGameData,
    IGameModifiers,
    IGameAccessors,
    IGameEvents,
    IGameMethods,
} from "./types";
import Slice from "../../Slice";

export default new Slice<
    IGameData,
    IGameModifiers,
    IGameAccessors,
    IGameEvents,
    IGameMethods
>({
    name: "game",
    initialState: {
    },
    modifiers: {
    },
    accessors: {
    },
    methods: {
    },
    save(data) {

        return data;
        // return {
        //     roles: [],
        //     homebrew: [...data.homebrew],
        //     scripts: {},
        //     script: [...data.script],
        // };

    },
    load(initialState, data) {

        return Object.assign(initialState, data);
        // return {
        //     roles: [
        //         ...initialState.roles,
        //         ...window.PG.roles,
        //     ],
        //     homebrew: [
        //         ...initialState.homebrew,
        //         ...(data?.homebrew || []),
        //     ],
        //     scripts: {
        //         ...window.PG.scripts,
        //     },
        //     script: [
        //         ...(data?.script || []),
        //     ],
        // };

    },
});
