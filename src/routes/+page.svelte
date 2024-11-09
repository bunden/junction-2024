<script lang="ts">
  import {Viewer3d} from "$components/3d";
  import {currentView} from "../globalStore";
  import type {Component} from "svelte";

  let View: Component | undefined = $state(undefined)

  currentView.subscribe((value: string | undefined) => {
    if(value === '2d'){
      View = undefined
    }

    if(value === '3d'){
      View = Viewer3d
    }

    if(value === undefined){
      View = undefined
    }
  })
</script>

{#if View}
  <View/>
{/if}
