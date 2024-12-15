import type {
	ISliceReducer,
} from "../types/classes";
import Slice from "./Slice";
import Storage from "./Storage";
import Observer from "../Observer";
import {
	UnrecognisedSliceError,
} from "../errors";
import {
	difference,
	isEmptyObject,
	update,
} from "../utilities/objects";

export default class Store {

	protected state: Record<string, any>;
	protected slices: Record<string, Slice>;
	protected storage: Storage;
	public events: Observer;

	constructor() {

		this.state = Object.create(null);
		this.slices = Object.create(null);
		this.storage = new Storage("pg");
		this.events = new Observer();

	}

	addSlice(slice: Slice) {

		const { slices, state } = this;
		const { name, initialState } = slice;

		slices[name] = slice;
		state[name] = initialState;

		slice.register(this);

	}

	makeActions(
		name: string,
		reducers: Record<string, ISliceReducer>,
	) {

		return Object.fromEntries(
			Object.entries(reducers).map(([property, reducer]) => [
				property,
				this.makeAction(name, reducer),
			])
		);

	}

	protected makeAction(name: string, reducer: ISliceReducer) {

		const { events, state } = this;

		return <T = any>(payload: T) => {

			const currentState = this.getState(name);
			const givenState = structuredClone(currentState);
			const response = reducer(givenState, {
				payload,
				trigger(eventName: string, detail: any) {
					events.trigger(`${name}/${eventName}`, detail);
				},
			});
			const responseState = (
				response === undefined
				? givenState
				: response
			);
			const diff = difference(currentState, responseState);
			
			if (isEmptyObject(diff)) {
				return;
			}

			state[name] = update(currentState, diff);
			events.trigger(`${name}/updateStore`, state[name]);
			events.trigger("updateStore", state);

		};

	}

	makeEvents(name: string) {

		const { events } = this;

		return {
			on(eventName: string, handler) {
				events.on(`${name}/${eventName}`, handler);
			},
			off(eventName: string, handler) {
				events.off(`${name}/${eventName}`, handler);
			},
		};

	}

	getSlice(name: string) {

		const { slices } = this;

		if (!Object.hasOwn(slices, name)) {
			throw new UnrecognisedSliceError(name);
		}

		// TODO: Allow type-safe slices to be returned.
		return slices[name];

	}

	getState(name: string) {

		const { state } = this;

		if (!Object.hasOwn(state, name)) {
			throw new UnrecognisedSliceError(name);
		}

		// TODO: return a copy rather than a reference.
		return state[name];

	}

	saveSlice(name: string) {

		const slice = this.getSlice(name);

		if (!slice.save) {
			return false;
		}

		const state = this.getState(name);
		const data = (
			slice.save === true
			? state
			: slice.save(state)
		);

		this.storage.set(name, data);

		return true;

	}

	loadSlice(name: string) {

		const slice = this.getSlice(name);

		const { initialState } = slice;

		this.state[name] = (
			slice.load
			? slice.load(initialState, this.storage.get(name))
			: initialState
		);

	}

	save() {

		Object.keys(this.slices).forEach((name) => {
			this.saveSlice(name);
		});

	}

	load() {

		Object.keys(this.slices).forEach((name) => {
			this.loadSlice(name);
		});

	}

}
