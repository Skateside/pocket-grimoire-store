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
    UnrecognisedScriptError,
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
        scripts: {},
        script: [],
        // TODO: include the script here?
    },
    modifiers: {
        reset({ state }) {
            state.augments.length = 0;
            state.script.length = 0;
            // TODO: reset all jinxes to be "theoretical"?
            return state;
        },
    },
    accessors: {
        getRole({ state }, id: string) {

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
        getSpecialRoles({ state }) {
            return state.roles.filter(({ edition }) => edition === "special");
        },
        getScripts({ state }) {
            return state.scripts;
        },
        getScriptById({ state }, id: string) {

            const script = state.scripts[id];

            if (!script) {
                throw new UnrecognisedScriptError(id);
            }

            return script;

        },
        // getScript({ state, references }) {
        //     references.getSpecial();
        //     return [];
        // },
    },
    // helpers: {
    //     getMeta({ state, references, accessors, helpers }, script) {
    //     }
    // },
    save(data) {

        // Ignore anything in `roles` - those are official roles and we can get
        // that data from a local variable rather than `localStorage`.
        return {
            roles: [],
            augments: [...data.augments],
            scripts: {},
            script: [...data.script],
        };

    },
    load(initialState, data) {

        const { PG } = (window as any);

        return {
            roles: [
                ...initialState.roles,
                ...PG.roles,
            ],
            augments: [
                ...initialState.augments,
                ...data.augments,
            ],
            scripts: {
                ...PG.scripts,
            },
            script: [
                ...data.script,
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
