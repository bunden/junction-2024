<script lang="ts">
  import '$assets/app.css';
  import * as Menubar from '$components/ui/menubar/index.js';
  import * as Tabs from '$components/ui/tabs';
  import * as ToggleGroup from '$components/ui/toggle-group';
  import * as AlertDialog from '$components/ui/alert-dialog/index.js';
  import * as Tooltip from "$components/ui/tooltip/index.js";
  import { Button } from '$components/ui/button';
  import { ScrollArea } from '$components/ui/scroll-area/index.js';
  import type { Snippet } from 'svelte';
  import Dropzone from 'svelte-file-dropzone';
  import {currentView} from "../globalStore";

  let { children }: { children: Snippet } = $props();

  const hasModel = $state(true);
  let activeFloorKey: string | undefined = $state('1');
  let floors: number[] = $state([1]);
  let activeEditor: '2d' | '3d' = $state('2d');
  let hasFloorPlan: boolean = $state(true);

  //let files: FileList | undefined = $state();

  let deleteBottomOffset = $derived.by(() => {
    const active: number = Number(activeFloorKey);
    return `${1.5 + active * 3.5}rem`;
  });

  const is3dViable = $derived.by(() => {
    return hasModel;
  });

  const addFloor = () => {
    const nextFloor = floors[floors.length - 1] + 1;
    floors = [...floors, nextFloor];
    activeFloorKey = String(nextFloor);
  };

  const deleteFloor = () => {
    const currentFloor = Number(activeFloorKey);
    const lastFloor = floors[floors.length - 1];
    if (lastFloor === currentFloor) {
      activeFloorKey = String(lastFloor - 1);
    }
    floors.splice(floors.length - 1, 1);
  };

  $effect(() => {
    if (activeFloorKey === undefined) {
      activeFloorKey = '1';
    }
  });

  $effect(() => {
    currentView.set(activeEditor)
  })

  let file: File | undefined = $state(undefined);

  const handleFilesSelect = (e: DragEvent) => {
    const receivedFiles = e.dataTransfer?.files
    const receivedTypes = e.dataTransfer?.types

    if(receivedFiles && receivedTypes){
      const allowedTypes = ['svg', 'png', 'jpg', 'jpeg'];
      if(allowedTypes.includes(receivedTypes[0])){
        file = receivedFiles[0]
      }
    }
  }
</script>

<main class="h-screen w-screen flex flex-col">
  <nav class="absolute top-0 left-0 right-0 h-8 bg-background z-30">
    <Menubar.Root class="h-8">
      <Menubar.Menu>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item>
            Import <Menubar.Shortcut>Alt + I</Menubar.Shortcut>
          </Menubar.Item>
          <Menubar.Item>
            Export <Menubar.Shortcut>Alt + E</Menubar.Shortcut>
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>
  </nav>
  <div class="w-full h-full background relative">
    <div class="absolute top-12 left-12 right-12 h-16 flex justify-center">
      {#if hasFloorPlan}
        <Tabs.Root bind:value={activeEditor}>
          <Tabs.List>
            <Tabs.Trigger value="2d">2D Editor</Tabs.Trigger>
            <Tabs.Trigger value="3d" disabled={is3dViable === false}>3D Editor</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      {/if}
    </div>

    {#if !hasFloorPlan}
      <Dropzone
        class="absolute bg-accent text-accent-foreground bottom-[1.75rem] gap-2 top-[1.75rem] left-[5.25rem] right-[5.25rem] rounded-3xl bg-opacity-50 opacity-50 outline outline-1 outline-offset-4 outline-accent-foreground text-center flex flex-col justify-center"
        ondrop={handleFilesSelect}
      >
        <span class="text-4xl font-bold">Drop a floor plan here</span>
        <span>SVG, PNG or JPG</span>
      </Dropzone>
    {/if}
    {@render children?.()}

    {file}

    <div class="absolute top-4 left-4 w-32 bottom-0 flex flex-col justify-end">
      <ScrollArea class="w-fit">
        <ToggleGroup.Root class="flex flex-col gap-2" bind:value={activeFloorKey} variant="outline" type="single">
          {#each floors.reverse() as floor}
            <ToggleGroup.Item
              class="h-12 w-12 opacity-75 transition duration-150 hover:opacity-100 text-lg bg-background"
              value={String(floor)}
            >
              {floor}
            </ToggleGroup.Item>
          {/each}
        </ToggleGroup.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <Button
              class="h-12 w-12 mb-6 mt-2 opacity-75transition-all delay-75 duration-150 hover:opacity-95 hover:bg-primary bg-primary hover:text-primary-foreground text-primary-foreground"
              onclick={() => addFloor()}
              builders={[builder]}
              variant="outline"
              value="+"
            >
              <span class="material-symbols-outlined scale-75">add</span>
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Add a new floor</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </ScrollArea>
      {#if floors.length > 1}
        <AlertDialog.Root>
          <AlertDialog.Trigger asChild let:builder>
            <Button
              style="bottom: {deleteBottomOffset};"
              class="w-12 h-12 absolute left-[3.25rem] hover:bg-red-600 bg-red-400 transition-all duration-150 hover:text-foreground text-foreground"
              builders={[builder]}
              variant="outline"
              value="+"
            >
              <span class="material-symbols-outlined scale-75">delete</span>
            </Button>
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Are you sure?</AlertDialog.Title>
              <AlertDialog.Description>
                This action cannot be undone. This will permanently delete this floor.
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
              <AlertDialog.Action onclick={() => deleteFloor()}>Continue</AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Root>
      {/if}
    </div>
  </div>
</main>

<style>
  .background {
    background-image: radial-gradient(#212121 1px, transparent 0);
    background-size: 1rem 1rem;
  }
</style>
