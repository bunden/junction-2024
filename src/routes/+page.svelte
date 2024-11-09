<script lang="ts">
  import {Viewer3d} from "$components/3d";
  import Viewer2d from "$components/2d/Viewer2d.svelte";
  import {blueprint, currentView} from "../globalStore";
  import {
    fade,
  } from 'svelte/transition';

  blueprint.subscribe((value: string | undefined) => {
    if(value === undefined){
      currentView.set(undefined)
    }
  })
</script>

{#if $currentView === '3d'}
  <span transition:fade={{duration: 150, delay: 150}}>
    <Viewer3d />
  </span>
{/if}

{#if $currentView === '2d' && $blueprint !== undefined}
  <span transition:fade={{duration: 150, delay: 150}}>
    <Viewer2d blueprint={$blueprint}/>
  </span>
{/if}

