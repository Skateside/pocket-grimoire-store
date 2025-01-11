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
- number of players (and travellers)
- player names
- seats (inc name and role)
- reminders
- jinxes?

Because this contains the "script" itself, we don't need to have any "homebrew" roles.

```typescript
const rolesSlice = new Slice({
    initialState: {
        roles: [/* ... */],
        scripts: {/* ...*/},
    },
    helpers: {
        augmentRole({ helpers }, official?: IRole, homebrew: Partial<IRole>) {

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

// NOTE: I don't like this because we end up having to get the data from 2
// slices - I'd prefer to keep that within 1 slice so I can call 1 function to
// get the script information.
```

## Settings Slice

A "settings" slice would keep track of any settings that are set.

## Track the inputs

The `<input>` elements need to have their values remembered.
This is mainly to keep track of the settings that have been chosen, and/such as the script that's been chosen.
