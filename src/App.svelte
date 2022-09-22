<script lang='ts'>
import { onMount } from 'svelte'
  import { test_krgl } from './test_krgl';
  import { test_sgl } from './test_sgl';
let canvas: HTMLCanvasElement;


onMount(() => {
  test_sgl(canvas)
})
  
</script>

<canvas bind:this={canvas}></canvas>