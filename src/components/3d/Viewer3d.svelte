<script lang="ts">
  import { Environment3d } from './index';
  import { floorStates, objectSelected, buildingTransparent } from '../../globalStore';

  let canvas: HTMLCanvasElement;
  let environment: Environment3d;

  let mouseDown: boolean = false;
  let mouseWheelDown: boolean = false;
  let mouseDownX: number | undefined = undefined;
  let mouseDownY: number | undefined = undefined;

  interface Props {
    hidden: boolean;
  }

  let { hidden }: Props = $props();

  $effect(() => {
    environment = new Environment3d(canvas);
  });

  floorStates.subscribe((floorStates) => {
    if (!environment) return;
    environment.reloadBuilding(floorStates, $buildingTransparent);
  });

  const mouseUpHandler = (event: MouseEvent) => {
    mouseDown = false;
    if (event.button === 1) mouseWheelDown = false;
    if (event.offsetX === mouseDownX && event.offsetY === mouseDownY) {
      $objectSelected = environment.handleObjectSelection();
    }
  };

  const mouseDownHandler = (event: MouseEvent) => {
    mouseDown = true;
    if (event.button === 1) mouseWheelDown = true;
    mouseDownX = event.offsetX;
    mouseDownY = event.offsetY;
  };

  const mouseMoveHandler = (event: MouseEvent) => {
    if (mouseDown && environment.selectedObject && !mouseWheelDown) {
      const movementSpeed = event.getModifierState('Shift') ? 0.05 : 0.005;
      const modifier = event.getModifierState('Control');
      environment.moveSelectedObject(event.movementX, event.movementY, movementSpeed, modifier);
    } else if (mouseDown) {
      if (event.getModifierState('Control')) {
        environment.moveCameraTarget(event.movementX, event.movementY);
      } else {
        environment.rotateCamera(event.movementX, event.movementY);
      }
    } else {
      environment.updateHighlightedObject(event.offsetX, event.offsetY);
    }
  };

  const mouseScrollHandler = (event: WheelEvent) => {
    if (event.getModifierState('Shift') && environment.selectedObject) {
      environment.rotateSelectedObject(event.deltaY);
    } else {
      environment.zoomCamera(event.deltaY);
    }
  };
</script>

<span class={hidden ? 'hidden' : ''}>
  <div style="position: absolute; top: 35px; z-index: 999">
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
    <button
      onclick={() => {
        environment.removeSelectedObject();
      }}
      disabled={!$objectSelected}>Delete</button
    >
    <input
      type="checkbox"
      onchange={() => {
        $buildingTransparent = !$buildingTransparent;
        environment.reloadBuilding($floorStates, $buildingTransparent);
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
</span>
