<script lang="ts">
  import Konva from 'konva';
  import { Stage } from 'svelte-konva';

  import FloorPlanner from '$components/2d/FloorPlanner.svelte';

  let width = $state(0);
  let height = $state(0);

  let stage: Konva.Stage | undefined = $state();

  const scaleBy = 1.01;
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

      let direction = e.evt.deltaY > 0 ? 1 : -1;

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
  <FloorPlanner blueprint="/blueprint.jpg" />
</Stage>
