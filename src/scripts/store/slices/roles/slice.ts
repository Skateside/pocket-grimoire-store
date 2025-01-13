import type {
    IRole,
    IRoleJinx,
    IRoleData,
    IRoleModifiers,
    IRoleAccessors,
    IRoleEvents,
    IRoleMethods,
    // IRoleMeta,
} from "./types";
import {
    UnrecognisedRoleError,
    UnrecognisedScriptError,
} from "./errors";
import Slice from "../../Slice";
import {
    difference,
    update,
} from "../../../utilities/objects";

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
        // reset({ state }) {
        //     state.script.length = 0;
        //     // TODO: reset all jinxes to be "theoretical"?
        //     return state;
        // },
        setScript({ state, payload, trigger }) {
            state.script = payload;
            trigger("script-set", payload);
            return state;
        },
    },
    accessors: {
        getRole({ state }, id) {
            return state.roles.find((role) => role.id === id);
        },
        getScriptRole({ helpers, state }, id) {

            return state.script.find((role) => (
                role === id
                || (
                    !helpers.isMetaRole(role)
                    && helpers.asRoleObject(role).id === id
                )
            )) as IRole | string;

        },
        getFullRole({ helpers, references }, id) {

            const role = references.getRole(id);
            const homebrew = references.getScriptRole(id);

            if (!role && !homebrew) {
                throw new UnrecognisedRoleError(id);
            }

            const update = helpers.asRoleObject(homebrew || id);
            const data = {
                ...(role || {}),
                ...update,
            } as IRole;

            const jinxes = combineJinxes(role?.jinxes, update.jinxes);

            if (jinxes) {
                data.jinxes = jinxes;
            }

            return data;

        },
        getRoleDiff({ references }, id) {

            return difference(
                references.getRole(id) || { id },
                references.getFullRole(id),
            );

        },
        getDiffedRole({ references }, id, diff) {
            return update(references.getRole(id) || { id }, diff) as IRole;
        },
        getSpecialRoles({ helpers, state }) {
            return state.roles.filter((role) => helpers.isSpecialRole(role));
        },
        getScript({ state }) {
            return state.script;
        },
        getScripts({ state }) {
            return state.scripts;
        },
        getScriptById({ state }, id) {

            const script = state.scripts[id];

            if (!script) {
                throw new UnrecognisedScriptError(id);
            }

            return script;

        },
    },
    methods: {
        isMetaRole(_info, role) {
            return typeof role === "object" && role.id === "_meta";
        },
        isSpecialRole(_info, role) {
            return (role as IRole).edition === "special";
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

const combineJinxes = (
    roleJinxes?: IRoleJinx[],
    homebrewJinxes?: IRoleJinx[],
) => {

    if (!roleJinxes?.length && !homebrewJinxes?.length) {
        return;
    }

    return (homebrewJinxes || []).reduce((jinxes, { id, reason }) => {

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
