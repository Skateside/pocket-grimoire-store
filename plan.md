# Plan

## Slices

The helpers should be able to access the other helpers - saves on typing.
This will need a new name (accessors -> references, modifiers -> actions, etc) ("methods" -> helpers?)
Helpers should be passed to both accessors and modifiers.

```typescript
type THelper; // TODO

class Slice<
    THelpers extends Record<string, AnyFunction> = {}, // unchanged
> {

    makeHelpers(helpers: THelpers) {

        return Object.fromEntries(
            Object.entries(helpers).map(([name, helper]) => [
                name,
                this.makeHelper(helper, name),
            ])
        );

    }

    makeHelper(helper: THelper, name: string) {

        return (...args: Tail<Parameters<THelper>>) => {

            const helpers = {
                ...this.helpers,
                [name]() {
                    throw new SelfHelperError(name);
                },
            };

            return helper({
                helpers,
            }, ...args);

        };

    }

}
```

## Game Slice

A "game" slice would keep track of the game itself
- the script that's been loaded (data can come from "roles" slice) (should remove this from the "roles" slice).
    _NOTE_ it makes more sense to keep this in the "roles" slice since all the role information is there.
- number of players (and travellers)
- player names
- seats (inc name and role)
- reminders
- jinxes?

Because this contains the "script" itself, we don't need to have any "homebrew" roles.

```typescript
/*
Script information in "game" slice - too seperated, too much work to get basic
information.
*/

const rolesSlice = new Slice({
    initialState: {
        roles: [/* ... */],
        scripts: {/* ...*/},
    },
    helpers: {
        augmentRole({ helpers }, official?: IRole, homebrew: Partial<IRole>) {
            /* ... */
        },
        isMetaRole({ helpers }, role: IRole | IRoleMeta | string): role is IRoleMeta {
            return typeof role === "object" && role.id === "_meta";
        },
        getMetaRole({ helpers }, script: IRoleScript) {
            return script.find((role) => helpers.isMetaRole(role));
        },
        getId({ helpers }, role: IRole | string) {
            return (
                typeof role === "string"
                ? role
                : role.id
            );
        },
        asRoleObject({ helpers }, role: IRole | string) {
            return (
                typeof role === "string"
                ? { id: role }
                : role
            );
        },
    },
});

const gameSlice = new Slice({
    initialState: {
        script: [],
    },
});

const { getScript } = gameSlice.references;
const {
    helpers: { asRoleObject, augmentRole, getId, isMetaRole },
    references: { getRole },
} = rolesSlice;

const fullRoles = getScript()
    .filter((role) => !isMetaRole(role))
    .map((role) => augmentRole(getRole(getId(role)), asRoleObject(role)));

```

_NOTE:_ I don't like this because we end up having to get the data from 2 slices - I'd prefer to keep that within 1 slice so I can call 1 function to get the script information.

```typescript
const rolesSlice = new Slice({
    initialState: {
        roles: {},
        scripts: {},
        script: [],
    },
    accessors: {
        getRole({ state, helpers }, id: string) {

            const official = state.roles[id];
            const homehrew = state.script.find((role) => {
                return role === id || role.id === id;
            });

            if (!official && !homebrew) {
                throw new UnregocnisedRoleError(id);
            }

            return helpers.augmentRole(
                official,
                helpers.asRoleObject(homebrew),
            );

        },
    },
    methods: {
        augmentRole({ helpers }, official?: IRole, homebrew?: Partial<IRole>) {
            /* ... */
        },
        isMetaRole({ helpers }, role: IRole | IRoleMeta | string): role is IRoleMeta {
            return typeof role === "object" && role.id === "_meta";
        },
        getMetaRole({ helpers }, script: IRoleScript) {
            return script.find((role) => helpers.isMetaRole(role));
        },
        getId({ helpers }, role: IRole | string) {
            return (
                typeof role === "string"
                ? role
                : role.id
            );
        },
        asRoleObject({ helpers }, role: IRole | string) {
            return (
                typeof role === "string"
                ? { id: role } as IRole
                : role
            );
        },
    },
});

type IGameCoords = {
    x: number,
    y: number,
    z?: number,
};

type IGameSeat = {
    coords: IGameCoords,
    name?: string,
    // Store a full Role here. A script that defines a homebrew role might have
    // been swapped out before the seat's role is cleared. Storing the full role
    // will allow that information to be displayed even if the script changes.
    // We need to know if the role can be localised.
    // roleId?: string,
    role?: IRole,
};

// TODO: Remove "roleId` and `index` with the information that's needed for the
// reminder - this avoids problems described in IGameSeat.
type IGameReminder = {
    coords: IGameCoords,
    reminder: {
        name: string,

    },
};

// We need bluff groups so that we can have seperate ones for Lunatic etc.
// Store the full role for the reasons described in IGameSeat.

type IGameBluffGroup = {
    name: string,
    bluffs: [IRole?, IRole?, IRole?],
};

const gameSlice = new Slice({
    initialState: {
        playerCount: 0,
        travellerCount: 0,
        names: [], // string[]
        seats: [], // IGameSeat[]
        reminders: [], // IGameReminders[]
        bluffs: [], // IGameBluffGroup[]
    },
});
```

### Localising roles

We need to work out how to localise a role even if the script changes some things.

Scenario:

1. Create a game of Trouble Brewing
2. Include gender-neutral terms ("Washerwoman" -> "Laundry Hand")
3. CHange the language to French

```typescript
const roles = [
    {
        "id": "washerwoman",
        "name": "Washerwoman",
        "edition": "tb",
        "team": "townsfolk",
        "firstNightReminder": "Show the Townsfolk character token. Point to both the *TOWNSFOLK* and *WRONG* players.",
        "otherNightReminder": "",
        "reminders": [
            "Townsfolk",
            "Wrong"
        ],
        "setup": false,
        "ability": "You start knowing that 1 of 2 players is a particular Townsfolk.",
        "flavor": "Bloodstains on a dinner jacket? No, this is cooking sherry. How careless.",
        "firstNight": 46,
        "otherNight": 0
    },
];

const en_GB = [
    {
        "id": "washerwoman",
        "name": "Washerwoman",
        "ability": "You start knowing that 1 of 2 players is a particular Townsfolk.",
        "firstNightReminder": "Show the character token of a Townsfolk in play. Point to two players, one of which is that character.",
        "otherNightReminder": "",
        "remindersGlobal": [],
        "reminders": [
            "Townsfolk",
            "Wrong"
        ]
    },
];

const script = [
    {
        "id": "washerwoman",
        "name": "Laundry Hand",
    },
];

// create the role
const theRole = {
    ...roles[0],
    ...en_GB[0],
    ...script[0],
};

const fr_FR = [
    {
        "id": "washerwoman",
        "name": "Lavandière",
        "ability": "Votre première nuit, le Conteur vous désigne 2 joueurs. Il vous donne ensuite le rôle de Villageois de l’un des deux.",
        "firstNightReminder": "Désigner 2 joueurs et présenter le jeton rôle Villageois de l'un d'eux.",
        "otherNightReminder": "",
        "remindersGlobal": [],
        "reminders": [
            "Villageois",
            "Autre"
        ]
    },
];

// create the role
const theRole = {
    ...roles[0],
    ...fr_FR[0],
    ...script[0],
};
```

Does it make more sense for `IGameSeat` to contain something like a "role diff"? **yes**

```typescript
// Was
type IGameSeat = {
    coords: IGameCoords,
    name?: string,
    role?: IRole,
};

// Better?
type IGameRoleDiff = {
    id: string,
    diff: IObjectDiff,
};

type IGameSeat = {
    coords: IGameCoords,
    name?: string,
    role?: IGameRoleDiff,
};

type IGameReminder = {
    coords: IGameCoords,
    reminder: IGameRoleDiff & {
        index: number,
    },
};

type IGameBluffGroup = {
    name: string,
    bluffs: [IGameRoleDiff?, IGameRoleDiff?, IGameRoleDiff?],
};


const rolesSlice = new Slice({
    initialState: {
        roles: {},
        scripts: {},
        script: [],
    },
    accessors: {
        getRole({ state }, id: string) {
            return state.roles[id];
        },
        getFullRole({ state, helpers }, id: string) {

            const official = state.roles[id];
            const homebrew = state.script.find((role) => (
                role === id || role.id === id
            ));

            if (!official && !homebrew) {
                throw new UnregocnisedRoleError(id);
            }

            return helpers.augmentRole(
                official,
                helpers.asRoleObject(homebrew),
            );

        },
        getRoleDiff({ state, helpers }, id: string) {

            const official = state.roles[id];
            const homebrew = helpers.asRoleObject(
                state.script.find((role) => (
                    role === id || role.id === id
                ))
            );

            return difference(official || {}, homebrew || {});

        },
    },
});
```

## Settings Slice

A "settings" slice would keep track of any settings that are set.

## Track the inputs

The `<input>` elements need to have their values remembered.
This is mainly to keep track of the settings that have been chosen, and/such as the script that's been chosen.

## Use WebComponents to create Tabs

Also create the "range slider with output" as a WebComponent.

I've had to hack the `Tabs` class to add a `Tabs.create()` function, which returns the instance, setting up the tabs. This feels wrong because I'm creating an instance just to ignore it. WebComponents might be the better solution as they can create the tabs for me.

We can probably use this to create tokens as well.

## Info Tokens

Info tokens should have space for multiple role tokens as well.

Use cases:

- "This character selecter you" with Cerenovus
- "These characters are not in play" with Demon bluffs.

```typescript
type IInfoToken = {
    id: string,
    text: string,
    colour: IInfoTokenColour,
    isCustom?: boolean,
    roleIds?: string[],
};
```

We wouldn't need to save the values of `rolesIds` but we'd need to reference them and show the token(s) when we show the info token.

```typescript
const infoTokens = new Slice({
    actions: {
        addRole({ state, payload, trigger }, id: string) {
            const { index, token } = getTokenOrDie(state, id);
            token.roleIds = payload;
            trigger("add-roles", { id: token.id, roleIds: payload });
            state[index] = token;
            return state;
        },
        clearRoles({ state, payload, trigger }, id: string) {
            const { index, token } = getTokenOrDie(state, id);
            delete token.roleIds;
            trigger("clear-roles", { id: token.id });
            state[index] = token;
            return state;
        },
    },
});

const getToken = (state: IInfoData, id: string) => {

    const index = state.findIndex((token) => token.id === id);

    return {
        index,
        token: state[index],
    };

};

const getTokenOrDie = (state: IInfoData, id: string) => {

    const info = getToken(state, id);

    if (!info.token) {
        throw new UnrecognisedInfoTokenError(id);
    }

    return info;

};

const getOfficialToken = (state: IInfoData, id: string) => {

    const info = getTokenOrDie(state, id);

    if (info.token.isCustom) {
        throw new InfoTokenNotOfficial(id);
    }

    return info;

};

const getCustomToken = (state: IInfoData, id: string) => {

    const info = getTokenOrDie(state, id);

    if (!info.token.isCustom) {
        throw new InfoTokenNotCustom(id);
    }

    return info;

};
```
