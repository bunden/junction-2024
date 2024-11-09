<script lang="ts">
  import Konva from 'konva';
  import { Layer, Image } from 'svelte-konva';

  interface FloorPlannerProps {
    blueprint: string;
  }

  type Point = { x: number; y: number };

  let { blueprint }: FloorPlannerProps = $props();

  let imageLayer: Konva.Layer | undefined = $state();
  let shapeLayer: Konva.Layer | undefined = $state();

  let image: HTMLImageElement | undefined = $state();
  let pos = $state({ x: 0, y: 0 });

  let clickPosition: Point | undefined = $state();

  const circles: Konva.Circle[] = $state([]);

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

    imageLayer.on('mousedown', () => {
      if (!imageLayer || !shapeLayer) return;
      const pointer = imageLayer.getRelativePointerPosition();
      if (!pointer) return;
      clickPosition = pointer;
    });

    imageLayer.on('mouseup', () => {
      if (!imageLayer || !shapeLayer) return;
      const pointer = imageLayer.getRelativePointerPosition();
      if (!pointer || !clickPosition) return;

      const xDiff = Math.abs(pointer.x - clickPosition.x);
      const yDiff = Math.abs(pointer.y - clickPosition.y);
      if (xDiff > 2 || yDiff > 2) {
        clickPosition = undefined;
        return;
      }

      const circle = new Konva.Circle({
        x: pointer.x,
        y: pointer.y,
        radius: 5,
        fill: 'blue',
        draggable: true
      });

      if (circles.length === 0) {
        shapeLayer.add(circle);
        circles.push(circle);
        return;
      }

      const firstCircle = circles[0];
      const lastCircle = circles[circles.length - 1];

      const xDiffFirst = Math.abs(pointer.x - firstCircle.x());
      const yDiffFirst = Math.abs(pointer.y - firstCircle.y());

      if (xDiffFirst < 15 && yDiffFirst < 15) {
        const line = new Konva.Line({
          points: [firstCircle.x(), firstCircle.y(), lastCircle.x(), lastCircle.y()],
          stroke: 'white',
          strokeWidth: 4
        });

        shapeLayer.add(line);
        return;
      }

      const line = new Konva.Line({
        points: [lastCircle.x(), lastCircle.y(), circle.x(), circle.y()],
        stroke: 'white',
        strokeWidth: 4
      });

      shapeLayer.add(circle);
      shapeLayer.add(line);
      circles.push(circle);
    });
  });
</script>

<Layer bind:handle={imageLayer}>
  <Image config={{ image, x: pos.x, y: pos.y, draggable: true, opacity: 0.75 }} />
</Layer>
<Layer bind:handle={shapeLayer}></Layer>
