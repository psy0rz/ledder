<script lang="ts">
    import { Input } from "framework7-svelte";
    import ControlInput from "../../ledder/ControlInput.js";

    export let control: ControlInput;
    export let path: Array<string> = [];
    export let onChanged: (path: Array<string>, values: {}) => void;
</script>

<Input
    type="textarea"
    value={control.text}
    on:input={(e) => {
        control.text = e.detail[0].target.value;

        let values = { ...control };
        delete values.meta;
        onChanged(path, values);

    }}
/>
