<script lang="ts">
import { onMount } from 'svelte';

import { test_proxygl } from './test_proxygl';
let canvas: HTMLCanvasElement;

onMount(() => {
  console.log('MOUNT');
  test_proxygl(canvas);
});
</script>

<canvas style="max-width: 100vw; max-height: 100vh;" bind:this={canvas} />
