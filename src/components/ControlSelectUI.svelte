<script lang="ts">
    import ControlSelect from "../../ledder/ControlSelect.js";
    import { Input } from "framework7-svelte";

    export let control: ControlSelect;
    export let path: Array<string> = [];
    export let onChanged: (path: Array<string>, values: {}) => void;
</script>

<Input
    type="select"
    label="Select"
    value={control.selected}
    on:input={(e) => {
        control.selected = e.detail[0].target.value;
        let values = { ...control };
        delete values.meta;
        onChanged(path, values);

    }}
>
    {#each control.meta.choices as choice}
        <option value={choice.id}>{choice.name}</option>
    {/each}
</Input>
