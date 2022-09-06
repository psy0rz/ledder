<Input
        type="select"
        label="Select"
        value={ control.selected }
        on:input={ (e)=>{
           control.selected=e.detail[0].target.value
           let values={...control}
           delete values.meta
           rpc.notify("display.control.updateValue", path, values)
       }}

>
    {#each control.meta.choices as choice}
        <option value="{choice.id}">{choice.name}</option>
    {/each}
</Input>

<script lang="ts">
    import {rpc} from "../js/web/RpcClient.js";
    import {ControlSelect} from "../js/ledder/ControlSelect.js";
    import {Input} from "framework7-svelte";

    export let control: ControlSelect;
    export let path: [];

</script>
