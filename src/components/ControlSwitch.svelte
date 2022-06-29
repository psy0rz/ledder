<Toggle checked={control.enabled} on:toggleChange={ (e)=>
                        {
                            control.enabled=e.detail[0]
                           let values={...control}
                           delete values.meta
                           rpc.notify("display.control.updateValue", path, values)


                        }}/>


<script lang="ts">
    import {rpc} from "../js/web/RpcClient.js";
    import {ControlValue} from "../js/ledder/ControlValue.js";
    import { Toggle} from "framework7-svelte";

    export let control: ControlValue;
    export let path: [];

</script>
