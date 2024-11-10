<script lang="ts">
  import Konva from 'konva';
  import { Stage } from 'svelte-konva';

  import FloorPlanner from '$components/2d/FloorPlanner.svelte';
  import { Button, buttonVariants } from '$components/ui/button/index.js';
  import * as Card from '$components/ui/card/index.js';
  import * as Dialog from '$components/ui/dialog';
  import { Input } from '$components/ui/input/index.js';
  import { Label } from '$components/ui/label/index.js';
  import * as Alert from '$components/ui/alert/index.js';

  import { fade } from 'svelte/transition';
  import { activeFloor, floorStates } from '../../globalStore';
  import type { Floor, Point } from '$utils/pointsToModel';
  import { onMount } from 'svelte';

  const notificationTime = 10000;

  let circles: { [key: string]: Konva.Circle[] | undefined } = $state({});

  let width = $state(0);
  let height = $state(0);
  let isClosed: { [key: string]: boolean | undefined } = $state({});
  let notifyStart = $state(false);
  let dialogOpen = $state(false);
  let successAlert = $state(false);
  let imageLayer: { [key: string]: Konva.Layer | undefined } = $state({});
  let shapeLayer: { [key: string]: Konva.Layer | undefined } = $state({});

  const setCircles = (key: string, value: Konva.Circle[] | undefined) => (circles[key] = value);
  const setIsClosed = (key: string, value: boolean | undefined) => (isClosed[key] = value);
  const setImageLayer = (key: string, value: Konva.Layer | undefined) => (imageLayer[key] = value);
  const setShapeLayer = (key: string, value: Konva.Layer | undefined) => (shapeLayer[key] = value);

  let stage: Konva.Stage | undefined = $state();

  interface Props {
    blueprint: string | undefined;
    hidden: boolean;
  }

  let { hidden }: Props = $props();

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

  const getPoints = (circles: Konva.Circle[]): Point[] => {
    return circles.map((circle) => {
      return {
        x: circle.x(),
        y: circle.y()
      };
    });
  };

  const submitFloor = () => {
    if ($floorStates !== undefined) {
      console.log(getPoints(circles['1']!));
      console.log(getPoints(circles['2']!));
      $floorStates = new Map(
        $floorStates.entries().map(([key, value]) => {
          const newValue = {
            ...value,
            height: floor.height,
            innerWallVectors: [],
            outerWallCorners: getPoints(circles[key]!),
            outerWallWidth: floor.outerWallWidth
          };

          console.log(newValue);

          return [key, newValue];
        })
      );

      successAlert = true;
      window.setTimeout(() => {
        successAlert = false;
      }, notificationTime);
    }
  };

  let clearCanvas = () => {
    shapeLayer[$activeFloor]?.destroyChildren();
    shapeLayer[$activeFloor]?.draw();

    circles[$activeFloor] = [];
    isClosed[$activeFloor] = false;
  };

  onMount(() => {
    window.setTimeout(() => {
      notifyStart = true;
    }, 1000);

    window.setTimeout(() => {
      notifyStart = false;
    }, notificationTime + 1000);
  });

  activeFloor.subscribe((floor) => {
    $floorStates.keys().forEach((key) => {
      if (key === floor) {
        imageLayer[key]?.show().moveToTop();
        shapeLayer[key]?.moveToTop();
        return;
      }
      imageLayer[key]?.hide();
    });
  });
</script>

<span class={hidden ? 'hidden' : ''}>
  <Stage bind:handle={stage} config={{ width, height }}>
    {#each $floorStates.entries() as [key, { blueprint }]}
      <FloorPlanner
        circles={circles[key]}
        isClosed={isClosed[key]}
        setIsClosed={(v) => setIsClosed(key, v)}
        setCircles={(v) => setCircles(key, v)}
        setImageLayer={(v) => setImageLayer(key, v)}
        setShapeLayer={(v) => setShapeLayer(key, v)}
        {blueprint}
      />
    {/each}
  </Stage>

  {#if successAlert}
    <span class="z-50" transition:fade={{ duration: 500 }}>
      <Alert.Root class="absolute top-12 right-4 w-80">
        <Alert.Title class="text-bold">Successfully converted shape to 3D!</Alert.Title>
        <Alert.Description>Go to 3d editor to view your shape.</Alert.Description>
      </Alert.Root>
    </span>
  {/if}

  {#if notifyStart}
    <span transition:fade={{ duration: 500 }}>
      <Alert.Root class="absolute top-12 right-4 w-80">
        <Alert.Title class="text-bold text-lg">How to get started?</Alert.Title>
        <Alert.Description>Draw outer lines of the floor by selecting the corners!</Alert.Description>
      </Alert.Root>
    </span>
  {/if}

  {#if isClosed[$activeFloor]}
    <span transition:fade={{ duration: 150 }}>
      <Card.Root class="w-96 absolute bottom-4 -translate-x-1/2 left-1/2 right-1/2">
        <Card.Header class="mb-4">
          <Card.Title class="text-bold text-lg">You have a complete building shape!</Card.Title>
          <Card.Description>Do you want to continue?</Card.Description>
        </Card.Header>
        <Card.Footer class="flex justify-between">
          <Button
            onclick={() => {
              clearCanvas();
            }}>Clear</Button
          >
          <Dialog.Root bind:open={dialogOpen}>
            <Dialog.Trigger
              onclick={() => {
                dialogOpen = true;
              }}
              class={buttonVariants({ variant: 'outline' })}>Continue</Dialog.Trigger
            >
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
                <Button
                  type="submit"
                  onclick={() => {
                    submitFloor();
                    dialogOpen = false;
                  }}>Convert to 3D</Button
                >
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </Card.Footer>
      </Card.Root>
    </span>
  {/if}
</span>
