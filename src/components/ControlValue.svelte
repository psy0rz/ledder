<Stepper
        bind:value={control.value}
        min={control.meta.min}
        max={control.meta.max}
        step={control.meta.step}
/>
<Range bind:value={control.value}
       min={control.meta.min}
       max={control.meta.max}
       step={control.meta.step}
       scaleSteps={5}
       scaleSubSteps={5}
       scale
       label={true}
       style="width:400px"
       on:rangeChange={ e=> {
                                   //control.value=e.detail[0]
                                   //rpc.notify("matrix.control.updateValue", control.meta.name, preset)
                               } }/>

<script>
    import {Range, Stepper} from "framework7-svelte";
    import {rpc} from "../js/web/RpcClient.js";

    export let control;

</script>
