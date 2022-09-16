<script lang="ts">
    import { Input } from "framework7-svelte";
    import { ControlColor } from "../js/ledder/ControlColor.js";

    export let control: ControlColor;
    export let path: Array<string> = [];
    export let onChanged: (path: Array<string>, values: {}) => void;

    let id = path.join("_").replace(/[^a-zA-Z0-9]/g, "_");

    // console.log("color", path, control);
</script>

<Input
    id="color-picker-{id}"
    type="colorpicker"
    label="Color Wheel"
    placeholder="Color"
    readonly
    value={{
        rgb: [control.r, control.g, control.b],
        alpha: control.a,
    }}
    colorPickerParams={{
        //                                    containerEl: "#color-picker-"+id,
        modules: ["wheel", "alpha-slider"],
        openIn: "popover",

        targetElSetBackgroundColor: true,
        targetEl: "#color-picker-" + id,
        backdrop: false,

        on: {
            //@ts-ignore
            change: (e, c) => {
                control.r = c.rgb[0];
                control.g = c.rgb[1];
                control.b = c.rgb[2];
                control.a = c.alpha;

                let values = { ...control };
                delete values.meta;
                onChanged(path, values);
            },
        },
    }}
/>
