<Page name="settings">
    <Navbar title="Settings"/>

    {#each $sveltePresets as preset, i}
        <BlockTitle>{preset.name}</BlockTitle>
        <Block inset >
            {#if preset instanceof ControlValue }
                <Range value="{preset.value}"
                       min="{preset.min}"
                       max="{preset.max}"
                       step="{preset.step}"
                       scale="true"
                       scaleSteps=5
                       label=true
                       on:rangeChange={ e=> { preset.value=e.detail[0] } }/>
            {:else if preset instanceof ControlColor}
                <div style="max-width: 200px" id="color-picker-{i}"></div>
                <Input
                        type="colorpicker"
                        label="Color Wheel"
                        placeholder="Color"
                        value={{
                            rgb: [preset.r, preset.g, preset.b],
                            alpha: preset.a
                        }}

                        colorPickerParams={{
                            containerEl: "#color-picker-"+i,
                            modules: ["wheel", "alpha-slider"]

                        }}
                />
            {:else}
                <b>Unknown control type!</b>
            {/if}
        </Block>
    {:else}
        leeg??
    {/each}


</Page>
<script>
    import {
        Page,
        Navbar,
        List,
        ListInput,
        ListItem,
        Toggle,
        BlockTitle,
        Row,
        Button,
        Range,
        Block, BlockFooter, Input
    } from 'framework7-svelte';

    import {sveltePresets} from "../js/svelteStore.js"
    import {ControlValue} from "../js/led/ControlValue.js";
    import {ControlColor} from "../js/led/ControlColor.js";


</script>
