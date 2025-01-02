import type {
    IRole,
    IRoleJinx,
    IRoleData,
    IRoleModifiers,
    IRoleAccessors,
    IRoleEvents,
} from "./types";
import {
    UnrecognisedRoleError,
} from "./errors";
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
        // TODO: include the script here?
    },
    modifiers: {
        reset({ state }) {
            state.augments.length = 0;
            // TODO: reset all jinxes to be "theoretical"?
            return state;
        },
    },
    accessors: {
        getData({ state }, id: string) {

            const role = state.roles.find((role) => role.id === id);
            const augment = state.augments.find((role) => role.id === id);

            if (!role && !augment) {
                throw new UnrecognisedRoleError(id);
            }

            const data = {
                ...(role || {}),
                ...(augment || {}),
            } as IRole;

            const jinxes = combineJinxes(role?.jinxes, augment?.jinxes);

            if (jinxes) {
                data.jinxes = jinxes;
            }

            return data;

        },
        getSpecial({ state }) {
            return state.roles.filter(({ edition }) => edition === "special");
        },
        // getScript({ state, references }) {
        //     references.getSpecial();
        //     return [];
        // },
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
                ...initialState.augments,
                ...data.augments,
            ],
        };

    },
});

const combineJinxes = (
    roleJinxes?: IRoleJinx[],
    augmentJinxes?: IRoleJinx[],
) => {

    if (!roleJinxes?.length && !augmentJinxes?.length) {
        return;
    }

    return (augmentJinxes || []).reduce((jinxes, { id, reason }) => {

        const index = jinxes.findIndex(({ id: jinxId }) => id === jinxId);

        if (!reason && index > -1) {
            jinxes.splice(index, 1);
        } else if (reason) {

            if (index > -1) {
                jinxes[index].reason = reason;
            } else {

                const jinx: IRoleJinx = {
                    id,
                    reason,
                };

                jinxes.push(jinx);

            }

        }

        return jinxes;

    }, roleJinxes || []);

};
