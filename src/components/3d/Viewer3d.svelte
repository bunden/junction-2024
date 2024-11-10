<script lang="ts">
  import { Environment3d } from './index';
  import { floorStates, objectSelected, buildingTransparent, exportModel } from '../../globalStore';
  import { Button } from '$components/ui/button/index.js';

  import Dropzone from 'svelte-file-dropzone';

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

  const handleFilesSelect = (e: DragEvent) => {
    const receivedFiles = e.dataTransfer?.files;

    if (receivedFiles) {
      environment.loadAdditionalModel(receivedFiles[0]);
    }
  };

  floorStates.subscribe((floorStates) => {
    if (!environment) return;
    environment.reloadBuilding(floorStates, $buildingTransparent);
  });

  exportModel.subscribe((bool) => {
    if (bool) {
      environment.exportModel();
      bool = false;
    }
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
      if (event.getModifierState('Shift')) {
        const modifier = event.getModifierState('Control');
        environment.moveCameraTarget(event.movementX, event.movementY, modifier);
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
  <Dropzone
    class="absolute bg-accent text-accent-foreground bottom-[1.75rem] gap-2 h-16 w-72 left-1/2 right-1/2 -translate-x-1/2 rounded-xl bg-opacity-50 opacity-50 outline outline-1 outline-offset-4 outline-accent-foreground text-center flex flex-col justify-center"
    noClick
    ondrop={handleFilesSelect}
  >
    <span class="font-semibold text-lg">Drop a 3D model to import</span>
  </Dropzone>

  <Button
    style="z-index: 999"
    class="absolute bottom-[1.75rem] right-[1.75rem] transition duration-150"
    onclick={() => {
      environment.removeSelectedObject();
      $objectSelected = false;
    }}
    variant="destructive"
    disabled={!$objectSelected}>Delete selected</Button
  >

  <div style="position: absolute; top: 35px; z-index: 999">
    <input
      type="checkbox"
      onchange={() => {
        $buildingTransparent = !$buildingTransparent;
        environment.reloadBuilding($floorStates, $buildingTransparent);
      }}
    />
    <button
      onclick={() => {
        environment.loadManualModel();
      }}>Load manual model</button
    >
  </div>

  <canvas
    bind:this={canvas}
    onmouseup={mouseUpHandler}
    onmousedown={mouseDownHandler}
    onmousemove={mouseMoveHandler}
    onwheel={mouseScrollHandler}
  ></canvas>
</span>
