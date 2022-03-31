<Page>
</Page>
<script>
  import {f7ready, Page} from 'framework7-svelte';
  import {runnerBrowser} from "../js/RunnerBrowser.js";
  import {onMount} from "svelte";
  export let animationName=""
  export let presetName=""

  onMount(()=>{
    f7ready( ()=>{
        // console.log("jo")
        runnerBrowser.run(animationName, presetName)

    })


  })

</script>
