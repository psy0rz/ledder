<script lang="ts">
    import { Range, Stepper } from "framework7-svelte";
    import ControlRange from "../../ledder/ControlRange.js"

    export let control: ControlRange;
    export let path: Array<string> = [];
    export let onChanged: (path: Array<string>, values: {}) => void;
</script>

<Stepper
    bind:value={control.from}
    min={control.meta.min}
    max={control.meta.max}
    step={control.meta.step}
/>
...
<Stepper
        bind:value={control.to}
        min={control.meta.min}
        max={control.meta.max}
        step={control.meta.step}
        on:change={ (e)=>{
            control=control

        }}
/>
<Range
        value={[control.from,control.to]}
    min={control.meta.min}
    max={control.meta.max}
    step={control.meta.step}
    scaleSteps={2}
    scaleSubSteps={10}
    dual={true}
    scale
    label={true}
    style="width:400px"
    on:rangeChange={(e) => {
        control.from = e.detail[0][0];
        control.to=e.detail[0][1];
        let values = { ...control };
        delete values.meta;
        onChanged(path, values);
    }}
/>
