<Input type="textarea" value={control.text}
       on:input={ (e)=>{
          control.text=e.detail[0].target.value

          let values={...control}
          delete values.meta
          rpc.notify("matrix.control.updateValue", path, values)
       }}
/>

<script lang="ts">
    import {rpc} from "../js/web/RpcClient.js";
    import {ControlValue} from "../js/ledder/ControlValue.js";
    import {Input} from "framework7-svelte";

    export let control: ControlValue;
    export let path: [];

</script>
