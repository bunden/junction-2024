<script lang="ts">
  import Konva from 'konva';
  import { Layer } from 'svelte-konva';

  interface MeterStickProps {
    meterStickLayer: Konva.Layer | undefined;
    onMeterStickLengthChange: (length: number) => void;
  }

  let { meterStickLayer = $bindable(), onMeterStickLengthChange }: MeterStickProps = $props();

  let leftCircle: Konva.Circle = new Konva.Circle({
    x: 200,
    y: 200,
    radius: 5,
    fill: 'rgba(100, 100, 255, 1)',
    draggable: true
  });
  let rightCircle: Konva.Circle = new Konva.Circle({
    x: 400,
    y: 200,
    radius: 5,
    fill: 'rgba(100, 100, 255, 1)',
    draggable: true
  });
  let text: Konva.Text = new Konva.Text({
    text: 'Meter stick',
    fontSize: 24,
    align: 'center',
    verticalAlign: 'center',
    fill: '#FFFFFF'
  });

  let line: Konva.Line = new Konva.Line({
    points: [leftCircle.x(), leftCircle.y(), rightCircle.x(), rightCircle.y()],
    stroke: 'rgba(255, 255, 255, 0.75)',
    strokeWidth: 4
  });

  const updateLine = () => {
    line.points([leftCircle.x(), leftCircle.y(), rightCircle.x(), rightCircle.y()]);
    const textX = (rightCircle.x() - leftCircle.x()) / 2 + leftCircle.x() - text.width() / 2;
    const textY = (rightCircle.y() - leftCircle.y()) / 2 + leftCircle.y() - 32;
    text.x(textX);
    text.y(textY);
    const meterStickLength = Math.sqrt(
      Math.pow(rightCircle.x() - leftCircle.x(), 2) + Math.pow(rightCircle.y() - leftCircle.y(), 2)
    );
    onMeterStickLengthChange(meterStickLength);
  };

  $effect(() => {
    meterStickLayer?.add(line, text, leftCircle, rightCircle);
    leftCircle.on('dragmove', updateLine);
    rightCircle.on('dragmove', updateLine);
    updateLine();
  });
</script>

<Layer bind:handle={meterStickLayer}></Layer>
