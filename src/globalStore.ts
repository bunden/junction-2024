import {type Writable, writable} from "svelte/store";

export const currentView: Writable<undefined | '2d' | '3d'> = writable(undefined)

export const blueprint: Writable<undefined | string> = writable(undefined)
