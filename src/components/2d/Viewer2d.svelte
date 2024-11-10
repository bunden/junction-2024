<script lang="ts">
  import Konva from 'konva';
  import { Stage } from 'svelte-konva';

  import FloorPlanner from '$components/2d/FloorPlanner.svelte';
  import { Button, buttonVariants } from '$components/ui/button/index.js';
  import * as Card from '$components/ui/card/index.js';
  import * as Dialog from '$components/ui/dialog';
  import { Input } from '$components/ui/input/index.js';
  import { Label } from '$components/ui/label/index.js';
  import * as Alert from "$components/ui/alert/index.js";

  import { fade } from 'svelte/transition';
  import { activeFloor, floorStates } from '../../globalStore';
  import type { Floor, Point } from '$utils/pointsToModel';
  import {onMount} from "svelte";

  let circles: Konva.Circle[] = $state([]);

  let width = $state(0);
  let height = $state(0);
  let isClosed = $state(false);

  let stage: Konva.Stage | undefined = $state();

  interface Props {
    blueprint: string | undefined;
    hidden: boolean;
  }

  let { blueprint, hidden }: Props = $props();

  const scaleBy = 1.15;
  let eventHandlerRegistered = false;
  $effect(() => {
    width = window.innerWidth;
    height = window.innerHeight;

    if (!stage || eventHandlerRegistered) return;
    stage.on('wheel', (e) => {
      if (!stage) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale
      };

      let direction = e.evt.deltaY > 0 ? -1 : 1;

      if (e.evt.ctrlKey) {
        direction = -direction;
      }

      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale
      };
      stage.position(newPos);
    });
    eventHandlerRegistered = true;
  });

  let floor: Floor = $state({
    number: 1,
    height: 3,
    outerWallCorners: [],
    outerWallWidth: 0.25,
    innerWallVectors: []
  });

  floorStates.subscribe((state) => {
    const floorState = state?.get($activeFloor);
    if (floorState?.outerWallCorners && floorState.outerWallCorners.length > 0) {
      isClosed = false;
    }
  });

  const getPoints = (): Point[] => {
    return circles.map((circle) => {
      return {
        x: circle.x(),
        y: circle.y()
      };
    });
  };

  const submitFloor = () => {
    if ($floorStates !== undefined) {
      const current = $floorStates.get($activeFloor);
      if (current?.blueprint) {
        $floorStates = $floorStates.set($activeFloor, {
          ...current,
          height: floor.height,
          innerWallVectors: [],
          outerWallCorners: getPoints(),
          outerWallWidth: floor.outerWallWidth
        });
      }
    }
  }

  let headsUp = $state(false)

  onMount(() => {
    window.setTimeout(() => {
      headsUp = true
    }, 1000)

    window.setTimeout(() => {
      headsUp = false
    }, 10000)
  })
</script>

<span class={hidden ? 'hidden' : ''}>
  <Stage bind:handle={stage} config={{ width, height }}>
    <FloorPlanner bind:circles bind:isClosed {blueprint} />
  </Stage>

  {#if headsUp}
  <span transition:fade={{duration: 500}}>
    <Alert.Root class="absolute top-12 right-4 w-80">
    <Alert.Title>How to get started?</Alert.Title>
    <Alert.Description
    >Draw outer lines of the floor by selecting the corners!</Alert.Description
    >
  </Alert.Root>
  </span>
{/if}

{#if isClosed}
    <span transition:fade={{ duration: 150 }}>
      <Card.Root class="w-96 absolute bottom-4 -translate-x-1/2 left-1/2 right-1/2">
        <Card.Header class="mb-4">
          <Card.Title>You have a complete building shape!</Card.Title>
          <Card.Description>Do you want to continue?</Card.Description>
        </Card.Header>
        <Card.Footer class="flex justify-between">
          <Button>Clear</Button>
          <Dialog.Root>
            <Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Continue</Dialog.Trigger>
            <Dialog.Content class="sm:max-w-[425px]">
              <Dialog.Header>
                <Dialog.Title>Add a floor</Dialog.Title>
                <Dialog.Description>Add some details about the floor!</Dialog.Description>
              </Dialog.Header>
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="width" class="text-right">Wall width</Label>
                  <Input id="width" bind:value={floor.outerWallWidth} class="col-span-3" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="height" class="text-right">Floor height</Label>
                  <Input id="height" bind:value={floor.height} class="col-span-3" />
                </div>
              </div>
              <Dialog.Footer>
                <Button onclick={() => submitFloor()}>Save changes</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </Card.Footer>
      </Card.Root>
    </span>
  {/if}
</span>
