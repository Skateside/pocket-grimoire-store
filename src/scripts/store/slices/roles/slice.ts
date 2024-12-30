import type {
    IRoleData,
    IRoleModifiers,
    IRoleAccessors,
    IRoleEvents,
} from "./types";
import Slice from "../../Slice";

export default new Slice<
    IRoleData,
    IRoleModifiers,
    IRoleAccessors,
    IRoleEvents
>({
    name: "roles",
    initialState: {
        roles: [],
        augments: [],
    },
    modifiers: {

    },
    accessors: {
    },
    save(data) {

        // Ignore anything in `roles` - those are official roles and we can get
        // that data from a local variable rather than `localStorage`.
        return {
            roles: [],
            augments: [...data.augments],
        };

    },
    load(initialState, data) {

        return {
            roles: [
                ...initialState.roles,
                ...(window as any).PG.roles,
            ],
            augments: [
                ...data.augments,
            ],
        };

    },
});
