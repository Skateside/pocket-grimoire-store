import type {
    // IRole,
    // IRoleJinx,
    IRoleData,
    IRoleModifiers,
    IRoleAccessors,
    IRoleEvents,
    IRoleMethods,
    // IRoleMeta,
} from "./types";
import {
    // UnrecognisedRoleError,
    UnrecognisedScriptError,
} from "./errors";
import Slice from "../../Slice";

export default new Slice<
    IRoleData,
    IRoleModifiers,
    IRoleAccessors,
    IRoleEvents,
    IRoleMethods
>({
    name: "roles",
    initialState: {
        roles: [],
        scripts: {},
        script: [],
    },
    modifiers: {
        reset({ state }) {
            state.script.length = 0;
            // TODO: reset all jinxes to be "theoretical"?
            return state;
        },
        setScript({ state, payload, trigger }) {
            state.script = payload;
            trigger("script-set", payload);
            return state;
        },
    },
    accessors: {
        getRole({ state }, id: string) {
            return state.roles.find((role) => role.id === id);
        },
        // getRoleDiff({ state }, id: string) {

        //     return [];

        // },
        /*
        getRole({ state }, id: string) {

            const role = state.roles.find((role) => role.id === id);
            const augment = state.homebrew.find((role) => role.id === id);

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
        */
        /*
        getSpecialRoles({ state }) {
            return state.roles.filter(({ edition }) => edition === "special");
        },
        */
        // TODO: Move this into a "game" slice.
        getScript({ state }) {
            return state.script;
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
        // getTeams({ state ]) {
            
        // }.
    },
    methods: {
        isMetaRole(_info, role) {
            return typeof role === "object" && role.id === "_meta";
        },
        getMetaRole({ helpers }, script) {
            return script.find((role) => helpers.isMetaRole(role));
        },
        getId(_info, role) {
            return (
                typeof role === "string"
                ? role
                : role.id
            );
        },
        asRoleObject(_info, role) {
            return (
                typeof role === "string"
                ? { id: role }
                : role
            );
        },
    },
    save(data) {

        return {
            roles: [],
            scripts: {},
            script: [...data.script],
        };

    },
    load(initialState, data) {

        return {
            roles: [
                ...initialState.roles,
                ...window.PG.roles,
            ],
            scripts: {
                ...window.PG.scripts,
            },
            script: [
                ...(data?.script || []),
            ],
        };

    },
});

/*
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
*/
