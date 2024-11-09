<script lang="ts">
  import { Viewer3d } from '$components/3d';
  import Viewer2d from '$components/2d/Viewer2d.svelte';
  import { activeFloor, floorStates, currentView } from '../globalStore';
  import { fade } from 'svelte/transition';
  import Dropzone from 'svelte-file-dropzone';

  let file: File | undefined = $state(undefined);

  const handleFilesSelect = (e: DragEvent) => {
    const receivedFiles = e.dataTransfer?.files;
    const receivedTypes = e.dataTransfer?.types;

    if (receivedFiles && receivedTypes) {
      //const allowedTypes = ['svg', 'png', 'jpg', 'jpeg'];
      file = receivedFiles[0];
      const url = window.URL.createObjectURL(file);
      if ($floorStates !== undefined) {
        const current = $floorStates.get($activeFloor);
        $floorStates = $floorStates.set($activeFloor, { ...current, blueprint: url });
      } else {
        $floorStates = new Map();
        $floorStates = $floorStates.set($activeFloor, { blueprint: url });
      }
    }
  };

  let currentBlueprint: string | undefined = $state(undefined);

  activeFloor.subscribe((floor) => {
    currentBlueprint = $floorStates?.get(floor)?.blueprint;
  });

  floorStates.subscribe((curValue) => {
    if (curValue?.get($activeFloor)) {
      currentBlueprint = curValue?.get($activeFloor)?.blueprint;
    } else {
      currentBlueprint = undefined;
    }
  });
</script>

{#if $currentView === '3d'}
  <span in:fade={{ duration: 150, delay: 150 }}>
    <Viewer3d />
  </span>
{/if}

{#if $currentView === '2d' && $floorStates !== undefined && currentBlueprint !== undefined}
  <span in:fade={{ duration: 150, delay: 150 }}>
    <Viewer2d blueprint={currentBlueprint} />
  </span>
{/if}

{#if $floorStates === undefined || currentBlueprint === undefined}
  <Dropzone
    class="absolute bg-accent text-accent-foreground bottom-[1.75rem] gap-2 top-14 left-[5.25rem] right-[5.25rem] rounded-3xl bg-opacity-50 opacity-50 outline outline-1 outline-offset-4 outline-accent-foreground text-center flex flex-col justify-center"
    ondrop={handleFilesSelect}
  >
    <span class="text-4xl font-bold">Drop a floor plan here</span>
    <span>PNG or JPG</span>
  </Dropzone>
{/if}
