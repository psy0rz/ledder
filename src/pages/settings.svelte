<Page name="settings" on:pageTabShow={ e=> { presets=$sveltePresets} }>
    <Navbar title="Settings"/>

    {#each presets as preset, i}
        <BlockTitle>{preset.name}</BlockTitle>
        <Block inset>
            {#if preset instanceof ControlValue }
                <Stepper
                        bind:value={preset.value}
                        min={preset.min}
                        max={preset.max}
                        step={preset.step}
                ></Stepper>
                <Range value={preset.value}
                       min={preset.min}
                       max={preset.max}
                       step={preset.step}
                       scaleSteps={5}
                       scaleSubSteps={5}
                       scale
                       label={true}
                       on:rangeChange={ e=> { preset.value=e.detail[0] } }/>
            {:else if preset instanceof ControlColor}
                <div style="max-width: 200px" id="color-picker-{i}"></div>
                <Input
                        type="colorpicker"
                        label="Color Wheel"
                        placeholder="Color"
                        readonly
                        value={{
                            rgb: [preset.r, preset.g, preset.b],
                            alpha: preset.a
                        }}

                        colorPickerParams={{
                            containerEl: "#color-picker-"+i,
                            modules: ["wheel", "alpha-slider"],
                            on: {
                                change: (e,c)=>{
                                    preset.r=c.rgb[0]
                                    preset.g=c.rgb[1]
                                    preset.b=c.rgb[2]
                                    preset.a=c.alpha
                                }
                            }
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
        BlockTitle,
        Range,
        Block, Input, Stepper
    } from 'framework7-svelte';

    import {sveltePresets} from "../js/svelteStore.js"
    import {ControlValue} from "../js/led/ControlValue.js";
    import {ControlColor} from "../js/led/ControlColor.js";

    let presets=[]

</script>
