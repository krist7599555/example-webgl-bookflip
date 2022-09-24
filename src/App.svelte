<script lang="ts">
import { onMount } from 'svelte';

import { test_book } from './test_book';

let canvas: HTMLCanvasElement;

onMount(() => {
  console.log('MOUNT');
  test_book(canvas);
});
</script>

<canvas style="max-width: 100vw; max-height: 100vh;" bind:this={canvas} />
