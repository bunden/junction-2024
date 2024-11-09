<script lang="ts">
  import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';
  import { Environment3d } from './index';

  let canvas: HTMLCanvasElement;
  let environment: Environment3d;

  let mouseDown: boolean = false;
  let cameraYaw: number = 0;
  let cameraPitch: number = 0;
  let cameraDistance: number = 10;
  let mouseDownX: number | undefined = undefined;
  let mouseDownY: number | undefined = undefined;

  $effect(() => {
    environment = new Environment3d(canvas);
  });

  const mouseUpHandler = (event: MouseEvent) => {
    mouseDown = false;
    if (event.offsetX === mouseDownX && event.offsetY === mouseDownY) {
      environment.handleObjectSelection();
    }
  };

  const mouseDownHandler = (event: MouseEvent) => {
    mouseDown = true;
    mouseDownX = event.offsetX;
    mouseDownY = event.offsetY;
  };

  const mouseMoveHandler = (event: MouseEvent) => {
    if (mouseDown && environment.selectedObject) {
      environment.moveSelectedObject(event.movementX / 1000, 0, event.movementY / 1000);
    } else if (mouseDown) {
      cameraYaw = cameraYaw - event.movementX / 2;
      cameraPitch = Math.min(Math.max(cameraPitch + event.movementY / 2, -85), 85);
      environment.setCameraRotation(cameraYaw, cameraPitch, cameraDistance);
    } else {
      environment.updateHighlightedObject(event.offsetX, event.offsetY);
    }
  };

  const mouseScrollHandler = (event: WheelEvent) => {
    cameraDistance = Math.min(Math.max(cameraDistance + event.deltaY / 100, 1), 50);
    environment.setCameraRotation(cameraYaw, cameraPitch, cameraDistance);
  };
</script>

<div style="position: absolute">
  <button
    onclick={() => {
      environment.loadManualModel();
    }}>Load manual model</button
  >
  <input
    type="file"
    id="fileInput"
    onchange={(event) => {
      if (!event.target) return;
      const files = (event.target as HTMLInputElement).files;
      if (!files) return;
      environment.loadAdditionalModel(files[0]);
    }}
  />
</div>

<canvas
  bind:this={canvas}
  onmouseup={mouseUpHandler}
  onmousedown={mouseDownHandler}
  onmousemove={mouseMoveHandler}
  onwheel={mouseScrollHandler}
></canvas>
