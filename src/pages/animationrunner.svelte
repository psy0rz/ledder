<Page>
</Page>
<script>
  import {f7ready, Page} from 'framework7-svelte';
  import {runnerBrowser} from "../js/RunnerBrowser.js";
  import {onMount} from "svelte";
  import {svelteLive} from "../js/svelteStore.js";
  export let animationName=""
  export let presetName=""

  onMount(()=>{
    f7ready( async ()=>{
        // console.log("jo")
        await runnerBrowser.run(animationName, presetName)

        if ($svelteLive) {
            // await tick()
            runnerBrowser.send()
        }

    })


  })

</script>
