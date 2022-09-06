<script lang="ts">
    import { Range, Stepper } from "framework7-svelte";
    import { ControlValue } from "../js/ledder/ControlValue.js";

    export let control: ControlValue;
    export let path: Array<string> = [];
    export let onChanged: (path: Array<string>, values: {}) => void;
</script>

<Stepper
    bind:value={control.value}
    min={control.meta.min}
    max={control.meta.max}
    step={control.meta.step}
/>
<Range
    bind:value={control.value}
    min={control.meta.min}
    max={control.meta.max}
    step={control.meta.step}
    scaleSteps={2}
    scaleSubSteps={10}
    scale
    label={true}
    style="width:400px"
    on:rangeChange={(e) => {
        control.value = e.detail[0];
        let values = { ...control };
        delete values.meta;
        onChanged(path, values);
    }}
/>
