<script lang="ts">
  import Konva from 'konva';
  import { Stage } from 'svelte-konva';

  import FloorPlanner from '$components/2d/FloorPlanner.svelte';
  import { Button } from "$components/ui/button/index.js";
  import * as Card from "$components/ui/card/index.js";

  import { fade } from 'svelte/transition'

  let width = $state(0);
  let height = $state(0);
  let isClosed = $state(false)

  let stage: Konva.Stage | undefined = $state();

  interface Props {
    blueprint: string;
  }

  let { blueprint }: Props = $props()

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
</script>

<Stage bind:handle={stage} config={{ width, height }}>
  <FloorPlanner bind:isClosed blueprint={blueprint} />
</Stage>

{#if isClosed}
  <span transition:fade={{duration: 150}} >
      <Card.Root class="w-96 absolute bottom-4 -translate-x-1/2 left-1/2 right-1/2">
      <Card.Header class="mb-4">
        <Card.Title>You have a complete building shape!</Card.Title>
        <Card.Description>Do you want to continue?</Card.Description>
      </Card.Header>
      <Card.Footer class="flex justify-between">
        <Button class="w-full">Continue</Button>
      </Card.Footer>
    </Card.Root>
  </span>
{/if}
