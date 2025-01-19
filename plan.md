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
    modifiers: {
        addRole({ state, payload, trigger }) {
            const { index, token } = getTokenOrDie(state, payload.id);
            token.roleIds = payload.roleIds;
            trigger("add-roles", payload);
            state[index] = token;
            return state;
        },
        clearRoles({ state, payload, trigger }) {
            const { index, token } = getTokenOrDie(state, payload);
            delete token.roleIds;
            trigger("clear-roles", { id: payload });
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

const getTokenOrDie = (
    state: IInfoData,
    id: string,
    type?: "official" | "custom",
) => {

    const info = getToken(state, id);

    if (!info.token) {
        throw new UnrecognisedInfoTokenError(id);
    }

    if (type !== undefined) {

        const { isCustom } = info.token;

        if (type === "official" && isCustom) {
            throw new InfoTokenNotOfficial(id);
        }

        if (type === "custom" && !isCustom) {
            throw new InfoTokenNotCustom(id);
        }

    }

    return info;

};

// ---

const infoTokenComponent = (getSlice) => {

    const infoTokensSlice = getSlice("info-tokens");
    const rolesSlice = getSlice("roles");

    infoTokenDialog.on("hide", () => {
        const infoToken = // ...
        infoTokensSlice.actions.clearRoles(infoToken.id);
    });

    const renderInfoToken = (id: string) => {

        const token = infoTokensSlice.references.getById(id);

        if (!token) {
            return;
        }

        // ...

        if (token.roleIds) {
            token.roleIds.forEach((roleId) => {
                // a WebComponent that takes the role ID and create the token.
                // element.append(create("role-token", { "role": roleId }));
                // ^-- not how WebComponents work :-(
                element.append(render("token", roleId));
            });
        }

    };

};
```

We need a way to register components so that we can access them from other components, allowing the "info token" component to get a role token.

Components, therefore, need an identifier and a way to pass them data.

```typescript
/*
class App = {

    run() {

        const {
            components,
            store,
        } = this;

        store.run();

        const getSlice = ((name: string) => store.getSlice(name)) as IAppGetSlice;
        components.forEach((component) => component(getSlice));

    }

}

const game = new App();
*/

class Component {
    // public readonly name: string;
    static get name() {
        return "";
    }
    render() {
    }
}

class RoleTokenComponent extends Component {
    static get name() {
        return "role-token";
    }
    render({ data, getSlice, getCompoent }) {

        const slice = getSlice("roles");
        const role = slice.references.getFullRole(data.id);

        return renderTemplate("#role-token-component", {
            ".js--role-token--name"(element) {
                element.textContent = role.name;
            },
            // ...
        });

    }
}

class InfoTokenComponent extends Component {
    static get name() {
        return "info-token";
    }
    render({ data, getSlice, getComponent }) {

        const slice = getSlice("info-tokens");
        const infoToken = slice.getById(data.id);

        return renderTemplate("#info-token-component", {
            ".js--info-token--text"(element) {
                element.innerHTML = toHTML(intoToken.text);
            },
            ".js--info-token--roles"(element) {

                if (!data.roleIds?.length) {
                    return;
                }

                data.roleIds.forEach((id) => {
                    element.append(getComponent("role-token", { id }));
                });
                element.hidden = false;

            },
        });

    }
}

class App {

    constructor() {
        this.components = Object.create(null);
    }

    registerComponent(component: Component) {
        this.components[component.name] = component;
    }

    // The Observer is supposed to allow me to trigger events in a sub-component
    // that are heard in the component that rendered it.
    renderComponent(id, data = {}, parentObserver?: IObserver) {

        const Component = this.components[id];

        if (!Component) {
            throw new UnrecognisedComponentError(id);
        }

        const observer = new Observer();

        return (new Component()).render({
            data,
            getSlice(name: string) {
                return this.store.getSlice(name);
            },
            render(name: string, data = {}) {
                if (name === id) {
                    throw new SelfRenderingComponentError(name);
                }
                return this.renderComponent(name, data, observer);
            },
            on(eventName: string, handler: IObserverHandler) {
                observer.on(eventName, handler);
            },
            off(eventName: string, handler: IObserverHandler) {
                observer.off(eventName, handler);
            },
            trigger(eventName: string, detail: any) {
                return parentObserver?.trigger(eventName, detail);
            },
        });

    }

    // run() {



    // }

}

class GameComponent extends Component {
    static get name() {
        return "game";
    }
    render({ getComponent }) {

        getComponent("script-selection");
        getComponent("role-selection");
        // etc.

    }
}

const game = new App();
game
    .registerComponent(RoleTokenComponent)
    .registerComponent(InfoTokenComponent)
    .registerComponent(GameComponent)
    ;
game.getComponent("game");
```

Would it make more sense to define components like this, similar to the way we define slices?

```typescript

class Component {

    public name: string;

    constructor(name: string, render: IComponentRender) {

        this.name = name;
        this.render = render;

    }

}

// components/role-token.ts
// Simple component - give it an ID and it'll render the role token.
export default new Component("role-token", ({ data, getSlice }) => {

    const slice = getSlice("roles");
    const role = slice.references.getFullRole(data.id);

    return renderTemplate("#role-token-component", {
        ".js--role-token--name"(element) {
            element.textContent = role.name;
        },
        // ...
    });

});

// components/info-token-list.ts
// Complex component - needs to update itself when the slice data changes.
export default new Component("info-token-list", ({
    data,
    getSlice,
    render,
    on,
}) => {

    const slice = getSlice("info-tokens");
    const wrapper = findOrDie("#info-token-wrapper");

    // List the info tokens that we currently know about.

    Object.entries(slice.getByType()).forEach(([type, infoTokens]) => {
        infoTokens.forEach(({ id, text }) => {
            findOrDieCached(`#info-token-list-${type}`)
                .append(render("info-token-trigger", { id, text }));
        });
    });

    // const dialog = render("dialog");
    on("trigger-click", ({ id }) => {

        findOrDie("#info-token-dialog").replaceWith(
            render("info-token-dialog", { id })
        );

    });

    // Modify the list as the tokens change.

    const { on: onSlice } = slice.events;

    onSlice("add", ({ id, text }) => {

        const list = findOrDieCached("#info-token-list-custom");
        list.append(render("info-token-trigger", { id, text }));

    });

    onSlice("update", ({ id, text }) => {

        const trigger = findOrDie(`[data-id="${infoToken.id}"]`, wrapper);
        trigger.replaceWith(render("info-token-trigger", { id, text }));

    });

    onSlice("remove", (id) => {
        findOrDie(`[data-id="${id}"]`, wrapper).remove();
    });

});

// components/info-token-trigger.ts
export default new Component("info-token-trigger", ({
    data,
    // getSlice,
    // render,
    trigger,
}) => {

    // const content = renderTemplate("#info-token-template", {
    return renderTemplate("#info-token-template", {
        ".js--info-token-trigger"(element) {
            element.textContent = strip(data.text);
            element.addEventListener("click", () => {
                trigger("trigger-click", { id: data.id });
            });
        },
    });

    // content.querySelector(".js--info-token--trigger").addEventListener("click", (e) => {
    //     e.preventDefault();
    //     trigger("trigger-click", { id: data.id });
    // });

    // return content;

});

// components/info-token-dialog.ts
export default new Component("info-token-dialog", ({
    data,
    getSlice,
    render,
}) => {

    const dialog = render("dialog");

});

export default new Component("dialog", () => {

    // render dialog
    // onclickoff = close
    // onesc = close
    // return render
    // Question: how do I close it from another component?

});
```
