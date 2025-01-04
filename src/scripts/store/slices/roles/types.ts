export type IRole = {
    id: string,
    team: IRoleTeam,
    name: string,
    ability: string,
    flavor?: string,
    image?: string | [string] | [string, string] | [string, string, string],
    edition?: string,
    firstNight?: number,
    firstNightReminder?: string,
    otherNight?: number,
    otherNightReminder?: string,
    setup?: boolean,
    reminders?: string[],
    remindersGlobal?: string[],
    jinxes?: IRoleJinx[],
    special?: IRoleSpecial[],
};

export type IRoleCoreTeam = "townsfolk" | "outsider" | "minion" | "demon";
export type IRolePlayTeam = IRoleCoreTeam | "traveller";
export type IRoleTeam = IRolePlayTeam | "fabled";

export type IRoleJinx = {
    id: string,
    reason: string,
    // state: "theoretical" | "potential" | "active",
};
// state: "theoretical" = this jinx exists but only the role is in the script,
//                        the id mentioned here isn't.
// state: "potential" = the role and the id are both in the script, but they not
//                      both in play.
// state: "active" = both the role and id are in play.

export type IRoleSpecial = {
    type: (
        "ability"
        | "reveal"
        | "selection"
        | "signal"
        | "vote"
    ),
    name: (
        "bag-disabled"
        | "bag-duplicate"
        | "card"
        | "distribute-votes"
        | "ghost-votes"
        | "grimoire"
        | "hidden"
        | "player"
        | "pointing"
        | "multiplier"
        | "replace-character"
    ),
    value?: number | string, // string doesn't have to be numeric.
    time?: (
        "pregame"
        | "day"
        | "night"
        | "firstNight"
        | "firstDay"
        | "otherNight"
        | "otherDay"
    ),
    global?: IRolePlayTeam,
};

export type IRoleMeta = {
    id: "_meta",
    name: string,
    author?: string,
    firstNight?: string[],
    otherNight?: string[],
};

export type IRoleScript = (IRoleMeta | IRole | string)[];

export type IRoleData = {
    roles: IRole[],
    homebrew: Partial<IRole>[],
    scripts: Record<string, IRoleScript>,
    script: IRoleScript,
};

export type IRoleModifiers = {
    reset: void,
    setScript: IRoleScript,
};

export type IRoleAccessors = {
    getRole: (id: string) => IRole,
    getSpecialRoles: () => IRole[],
    getScripts: () => Record<string, IRoleScript>,
    getScriptById: (id: string) => IRoleScript,
};

export type IRoleEvents = {
    "script-set": IRoleScript,
};

export type IRoleHelpers = {
    getMeta: (script: IRoleScript) => IRoleMeta | void,
};
