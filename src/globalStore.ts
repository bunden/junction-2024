import { type Writable, writable } from 'svelte/store';

export const currentView: Writable<undefined | '2d' | '3d'> = writable(undefined);

export const floorStates: Writable<
  | undefined
  | Map<
      string,
      {
        blueprint: string;
        outerWallCorners?: { x: number; y: number }[];
      }
    >
> = writable(undefined);

export const activeFloor: Writable<string> = writable('1');
