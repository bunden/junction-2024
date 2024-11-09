<script lang="ts">
  import * as THREE from 'three';
  import { Environment3d } from './index';

  let canvas: HTMLCanvasElement;
  let environment: Environment3d;

  let mouseDown: boolean = false;
  let cameraYaw: number = 0;
  let cameraPitch: number = 0;
  let cameraDistance: number = 10;

  $effect(() => {
    environment = new Environment3d(canvas);
  });

  const mouseMoveHandler = (event: MouseEvent) => {
    if (mouseDown) {
      cameraYaw = cameraYaw - event.movementX / 2;
      cameraPitch = Math.min(Math.max(cameraPitch + event.movementY / 2, -85), 85);
      environment.setCameraRotation(cameraYaw, cameraPitch, cameraDistance);
    }
  };

  const mouseScrollHandler = (event: WheelEvent) => {
    cameraDistance = Math.min(Math.max(cameraDistance + event.deltaY / 100, 1), 50);
    environment.setCameraRotation(cameraYaw, cameraPitch, cameraDistance);
  };
</script>

<canvas
  bind:this={canvas}
  onmouseup={() => {
    mouseDown = false;
  }}
  onmousedown={() => {
    mouseDown = true;
  }}
  onmousemove={mouseMoveHandler}
  onwheel={mouseScrollHandler}
></canvas>
