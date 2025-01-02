## Creating a Slice

```ts
const slice = new Slice<{
    PetData,
    PetModifiers,
    PetAccessors,
    PetEvents
}>({
    name: "pets",
    initialState: [],
    modifiers: {},
    accessors: {},
    save(data) {
    },
    load(initialState, data) {
    },
});
```

The `Slice` takes 4 generic variables:

1. Data - The structure of the data.
2. Modifiers - method names versus the payload type.
3. Accessors - methods versus functions (including parameters) and the return value.
4. Events - Event names versus the detail.

### Data Variable

This describes the data that the slice will manage. This is the same type as the `initialState` property (although it may not be populated).

```ts
type Pet = {
    name: string,
    age: number,
    type: "cat" | "dog",
}

type PetData = Pet[];

const slice = new Slice<
    PetData,
    // ...
>({
    initialState: [],
    // ...
});
```

### Modifiers Variable

A modifier adjusts the state in some way, optionally with a payload and triggering events. The modifier generics define the method name and the payload.

Modifiers become **actions** - these are functions which accept the payload.

```ts
type PetModifiers = {
    add: Pet,
};

const slice = new Slice<
    PetModifiers,
    // ...
>({
    modifiers: {
        add({ payload, state, trigger }) {
            state.push(payload);
            trigger("add", payload);
            return state;
        },
    },
    // ...
});

slice.actions.add({
    name: "fido",
    age: 3,
    type: "dog",
});
```

### Accessors Variable

Accessors allow part of the slice's data to be accessed and returned. They're defined as methods to functions because they might have additional parameters.

The first parameter in an accessor is information. It's an object containing 2 properties:

- `state`: A copy of the current state. Mutating this does not affect the state itself.
- `references`: Any references that are created as a result of these accessors.

Accessors become **references** - these are functions which allow data to be accessed.

```ts
type PetAccessors = {
    getByName: (name: string) => MyDatum | undefined,
    getDogs: () => PetData,
};

const slice = new Slice<
    PetAccessors,
    // ...
>({
    accessors: {
        getByName({ state }, name) {
            return state.find((datum) => datum.name === name);
        },
        getDogs({ state }) {
            return state.filter(({ type }) => type === "dog");
        },
    },
});

const fido = slice.references.getByName("fido");
// { name: "fido", age: 3, type: "dog" }
const dogs = slice.references.getDogs();
// [{ name: "fido", age: 3, type: "dog" }]
```

### Events Variable

The events define any events that the slice might trigger. They're written as event names to the details. Events might get triggered in the **modifiers**.

The `events` property only exposes `on` and `off` methods.

```ts
type PetEvents = {
    add: MyDatum,
};

const slice = new Slice<
    PetEvents,
    // ...
>({
    modifiers: {
        add({ payload, state, trigger }) {
            state.push(payload);
            trigger("add", payload);
            return state;
        },
    },
});

slice.events.on("add", (datum) => {
    // triggers when a pet is added.
});
```

### Name Property

The slice's name. This will be used to identify it and access it from the store.

```ts
const store = new Store();
store.addSlice(new Slice<
    // ...
>({
    name: "pets",
    // ...
}));

const slice = store.getSlice("pets");
```

### Initial State Property

The initial state is the basic form of the data, usually empty. It's defined using the Data Variable.

```ts
new Slice<
    // ...
>({
    initialState: [],
    // ...
});
```

### Modifiers Property

The Modifiers allow the state to be modified - the Modifiers Variable helps to define them. Each method gets 1 parameter: an object with 3 properties:

- `state` - the current state of the slice.
- `payload` - the payload that's been passed to the action.
- `trigger` - a function that can trigger events on this slice.

```ts
const slice = new Slice<
    // ...
>({
    modifiers: {
        add({ payload, state, trigger }) {
            state.push(payload);
            trigger("add", payload);
            return state;
        },
    },
});

slice.actions.add({
    name: "fido",
    age: 3,
    type: "dog",
});
```

## Accessors Property

The Accessors property defines the functions that will get information from the state. They're partially defined by the Accessors Variable.

```ts
const slice = new Slice<
    // ...
>({
    accessors: {
        getByName({ state }, name) {
            return state.find((datum) => datum.name === name);
        },
    },
});

const fido = slice.references.getByName("fido");
// { name: "fido", age: 3, type: "dog" }
```

### Save Property

The `save` property is optional and will be 1 of 3 things:

- `true` (default) - the slice's data will be saved unchanged.
- `false` - the slice's data won't be saved.
- function - a function that returns the data to be saved.

### Load Property

The `load` property is optional and will be 1 of 2 things:

- `false` - the slice's data won't be loaded.
- function (default) - A function that defines how the data is loaded.


