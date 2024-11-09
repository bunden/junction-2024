<script lang="ts">
  import Konva from 'konva';
  import { Layer, Image } from 'svelte-konva';

  interface FloorPlannerProps {
    blueprint: string;
  }

  let { blueprint }: FloorPlannerProps = $props();

  let imageLayer: Konva.Layer | undefined = $state();
  let shapeLayer: Konva.Layer | undefined = $state();

  let image: HTMLImageElement | undefined = $state();
  let pos = $state({ x: 0, y: 0 });

  // Center and fit the image
  $effect(() => {
    if (!imageLayer) return;

    const canvas = imageLayer.getCanvas();

    const width = canvas.getWidth();
    const height = canvas.getHeight();

    const element = new window.Image();
    element.src = blueprint;
    element.onload = () => {
      const imageWidth = element.width;
      const imageHeight = element.height;

      const hRatio = width / imageWidth;
      const vRatio = height / imageHeight;

      const ratio = Math.min(hRatio, vRatio);

      element.width = imageWidth * ratio;
      element.height = imageHeight * ratio;

      const xOffset = (width - element.width) / 2;
      const yOffset = (height - element.height) / 2;

      pos = { x: xOffset, y: yOffset };
      image = element;
    };
  });
</script>

<Layer bind:handle={imageLayer}>
  <Image config={{ image, x: pos.x, y: pos.y, draggable: true }} />
</Layer>
<Layer bind:handle={shapeLayer}></Layer>
