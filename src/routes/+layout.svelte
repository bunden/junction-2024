<script lang="ts">
  import '$assets/app.css';
  import * as Menubar from '$components/ui/menubar/index.js';
  import * as Tabs from '$components/ui/tabs';
  import * as ToggleGroup from '$components/ui/toggle-group';
  import * as AlertDialog from '$components/ui/alert-dialog/index.js';
  import * as Tooltip from '$components/ui/tooltip/index.js';
  import { Button } from '$components/ui/button';
  import { ScrollArea } from '$components/ui/scroll-area/index.js';
  import type { Snippet } from 'svelte';
  import { activeFloor, floorStates, currentView, exportModel } from '../globalStore';

  import { fade } from 'svelte/transition';

  let { children }: { children: Snippet } = $props();

  const hasModel = $state(true);
  let floors: number[] = $state([1]);
  let activeEditor: '2d' | '3d' = $state('2d');

  let deleteBottomOffset = $derived.by(() => {
    const active: number = Number($activeFloor);
    return `${1.5 + active * 3.5}rem`;
  });

  const is3dViable = $derived.by(() => {
    return hasModel;
  });

  const addFloor = () => {
    const nextFloor = floors[floors.length - 1] + 1;
    floors = [...floors, nextFloor];
    $activeFloor = String(nextFloor);
  };

  const deleteFloor = () => {
    const currentFloor = Number($activeFloor);
    const lastFloor = floors[floors.length - 1];
    if (lastFloor === currentFloor) {
      $activeFloor = String(lastFloor - 1);
    }
    floors.splice(floors.length - 1, 1);
  };

  $effect(() => {
    if ($activeFloor === undefined) {
      $activeFloor = '1';
    }
  });

  $effect(() => {
    currentView.set(activeEditor);
  });
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
          <Menubar.Item
            onclick={() => {
              $exportModel = true;
            }}
          >
            Export <Menubar.Shortcut>Alt + E</Menubar.Shortcut>
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>
  </nav>
  <div class="w-full h-full background relative">
    <div class="absolute top-12 left-1/2 right-1/2 -translate-x-1/2 h-16 flex z-30 justify-center">
      {#if $floorStates?.get($activeFloor) !== undefined}
        <span transition:fade={{ duration: 150, delay: 150 }}>
          <Tabs.Root bind:value={activeEditor} class="w-fit">
            <Tabs.List>
              <Tabs.Trigger value="2d">2D Editor</Tabs.Trigger>
              <Tabs.Trigger value="3d" disabled={is3dViable === false}>3D Editor</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </span>
      {/if}
    </div>

    {@render children?.()}

    <div class="absolute top-4 left-4 w-12 bottom-0 flex flex-col justify-end">
      <ScrollArea class="w-fit">
        <ToggleGroup.Root class="flex flex-col gap-2" bind:value={$activeFloor} variant="outline" type="single">
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
              class="w-12 h-12 absolute left-[3.25rem] hover:bg-red-600 bg-red-400 transition duration-150 hover:text-foreground text-foreground"
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
