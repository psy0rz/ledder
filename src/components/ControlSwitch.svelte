<script lang="ts">
    import { Toggle } from "framework7-svelte";
    import { ControlSwitch } from "../js/ledder/ControlSwitch.js";

    export let control: ControlSwitch;
    export let path: Array<string> = [];
    export let onChanged: (path:Array<string>, values:{})=>void

</script>

<Toggle
    checked={control.enabled}
    on:toggleChange={(e) => {
        control.enabled = e.detail[0];
        let values = { ...control };
        delete values.meta;
        onChanged(path, values);

    }}
/>
