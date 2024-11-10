import { type Writable, writable } from 'svelte/store';
import type { Point, WallParameters } from '$utils/pointsToModel';

export const currentView: Writable<undefined | '2d' | '3d'> = writable(undefined);

export const floorStates: Writable<
  Map<
    string,
    {
      blueprint?: string;
      outerWallCorners?: Point[];
      height?: number;
      outerWallWidth?: number;
      innerWallVectors?: WallParameters[];
    }
  >
> = writable(new Map([['1', {}]]));

export const activeFloor: Writable<string> = writable('1');

export const objectSelected: Writable<boolean> = writable(false);

export const buildingTransparent: Writable<boolean> = writable(false);

export const exportModel: Writable<boolean> = writable(false);
