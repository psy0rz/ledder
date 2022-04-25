<canvas class="ledder-matrix" id="ledder-preview"></canvas>
<script>
    import {Scheduler} from "../js/ledder/Scheduler.js";
    import {MatrixCanvas} from "../js/web/MatrixCanvas.js";
    import {onMount} from 'svelte';
    import {runnerBrowser} from "../js/web/RunnerBrowser.js";

    import {svelteLive, sveltePresets, svelteSelectedTitle} from "../js/web/svelteStore.js"
    import {rpc} from "../js/web/RpcClient.js";
    import {f7ready} from "framework7-svelte";



    onMount(async () => {
        f7ready(async () => {
            // let scheduler = new Scheduler();
            let width = 40
            let height = 8
            rpc.matrix = new MatrixCanvas(width, height, '#ledder-preview');
            // matrix.run();
            runnerBrowser.init(rpc.matrix)

            await rpc.request('context.startPreview', width, height)

            /**
             rpc.matrix.preset.setCallbacks(
             ()=>{
            //reset
            sveltePresets.set([])

        },
             (control)=>{
            //add control
            sveltePresets.update(p => {
                p.push(control)
                return p
            })

        },
             (controlName, controlValues)=>{
            //update values on server side
            if ($svelteLive) {
                rpc.notify("matrix.preset.updateValue", controlName, controlValues)
            }
        }

             )**/
        })
    })
</script>
