<script lang="ts">
  import Konva from 'konva';
  import { Layer, Image } from 'svelte-konva';
  import type { Point } from '$utils/pointsToModel';

  interface FloorPlannerProps {
    blueprint: string | undefined;
    isClosed: boolean;
    circles: Konva.Circle[] | undefined;
    setIsClosed: (v: boolean | undefined) => void;
    setCircles: (v: Konva.Circle[]) => void;
    setImageLayer: (v: Konva.Layer | undefined) => void;
    setShapeLayer: (v: Konva.Layer | undefined) => void;
  }

  let { blueprint, isClosed, circles, setIsClosed, setCircles, setImageLayer, setShapeLayer }: FloorPlannerProps =
    $props();

  let imageLayer: Konva.Layer | undefined = $state();
  let shapeLayer: Konva.Layer | undefined = $state();

  let image: HTMLImageElement | undefined = $state();
  let pos = $state({ x: 0, y: 0 });

  let clickPosition: Point | undefined = $state();

  let poly: Konva.Line | undefined = undefined;

  const calculatePolyShape = () => {
    if (isClosed && shapeLayer && circles) {
      const points = circles
        .map((circle) => {
          return [circle.x(), circle.y()];
        })
        .flat();

      if (poly !== undefined) {
        poly.destroy();
      }

      poly = new Konva.Line({
        points: points,
        fill: 'rgba(0, 0, 0, 0.25)',
        stroke: 'rgba(0, 0, 0, 0.75)',
        strokeWidth: 5,
        closed: true
      });

      shapeLayer.add(poly);
      poly.moveToBottom();
    }
  };

  $effect(() => {
    if (circles !== undefined) return;
    setIsClosed(false);
  });
  $effect(() => {
    if (circles) return;
    setCircles([]);
  });
  $effect(() => {
    if (!imageLayer) return;
    setImageLayer(imageLayer);
  });
  $effect(() => {
    if (!shapeLayer) return;
    setShapeLayer(shapeLayer);
  });

  $effect(() => {
    if (!imageLayer || !blueprint) return;

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
      if (!imageLayer || !shapeLayer || isClosed) return;
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
        fill: 'rgba(255, 100, 100, 1)',
        draggable: true
      });

      if (!circles) return;
      if (circles.length == 0) {
        shapeLayer.add(circle);
        setCircles([...circles, circle]);
        return;
      }

      const firstCircle = circles[0];
      const lastCircle = circles[circles.length - 1];

      const xDiffFirst = Math.abs(pointer.x - firstCircle.x());
      const yDiffFirst = Math.abs(pointer.y - firstCircle.y());

      if (xDiffFirst < 10 && yDiffFirst < 10) {
        const line = new Konva.Line({
          points: [firstCircle.x(), firstCircle.y(), lastCircle.x(), lastCircle.y()],
          stroke: 'rgba(255, 255, 255, 0.75)',
          strokeWidth: 4
        });
        firstCircle.on('dragmove', () => {
          calculatePolyShape();
          line.points([firstCircle.x(), firstCircle.y(), lastCircle.x(), lastCircle.y()]);
        });
        lastCircle.on('dragmove', () =>
          line.points([firstCircle.x(), firstCircle.y(), lastCircle.x(), lastCircle.y()])
        );

        shapeLayer.add(line);
        setIsClosed(true);

        line.moveToBottom();
        return;
      }

      const line = new Konva.Line({
        points: [lastCircle.x(), lastCircle.y(), circle.x(), circle.y()],
        stroke: 'rgba(255, 255, 255, 0.75)',
        strokeWidth: 4
      });
      circle.on('dragmove', () => {
        calculatePolyShape();
        line.points([lastCircle.x(), lastCircle.y(), circle.x(), circle.y()]);
      });
      lastCircle.on('dragmove', () => line.points([lastCircle.x(), lastCircle.y(), circle.x(), circle.y()]));

      shapeLayer.add(circle);
      shapeLayer.add(line);
      line.moveToBottom();
      setCircles([...circles, circle]);
    });
  });

  $effect(() => calculatePolyShape());
</script>

<Layer bind:handle={imageLayer}>
  <Image config={{ image, x: pos.x, y: pos.y, draggable: true, opacity: 0.5 }} />
</Layer>
<Layer bind:handle={shapeLayer}></Layer>
