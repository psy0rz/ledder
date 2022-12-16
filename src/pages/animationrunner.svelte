<Page>
</Page>
<script>
  import {f7ready, Page} from 'framework7-svelte';
  import {runnerBrowser} from "../js/web/RunnerBrowser.js";
  import {onMount} from "svelte";
  import {svelteLive} from "../js/web/svelteStore.js";
  import {error} from "../js/web/util.js";
  // export let animationName=""
  // export let presetName=""
  export let nameAndPreset

  onMount(()=>{
    f7ready( async ()=>{

        if (!nameAndPreset)
            return

        console.log("Run: ", nameAndPreset)

        let animationName=nameAndPreset.match(RegExp("(^.*)/"))[1]
        let presetName=nameAndPreset.match(RegExp("[^/]+$"))[0]

        console.log("Animation name: ", animationName)
        console.log("Preset name: ", presetName)
        try {
            await runnerBrowser.run(animationName, presetName)
        }
        catch (e) {
            error(`Error starting ${animationName}/${presetName}`, e)
        }
        if ($svelteLive) {
            // await tick()
            await runnerBrowser.send()
        }

    })


  })

</script>
