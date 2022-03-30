<Page name="settings" on:pageTabShow={ e=> { presets=$sveltePresets} }>
    <Navbar title="Controls"
     subtitle={$svelteSelectedTitle}

    >

    </Navbar>

    <Toolbar position="top" >
        <Button iconMd="material:save" on:click={ onSave } />
        <Button iconMd="material:delete" on:click={ onDelete } />
        <Button iconMd="material:file_copy" on:click={ onCopy } />
    </Toolbar>

    {#each presets as preset, i}
        <BlockTitle>{preset.name}</BlockTitle>
        <Block inset>
            {#if preset instanceof ControlValue }
                <Stepper
                        bind:value={preset.value}
                        min={preset.min}
                        max={preset.max}
                        step={preset.step}
                />
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
                                    //we use this instead of onChange, because we want realtime updates
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
        Block, Input, Stepper, Button, Toolbar, Icon, Link, NavRight
    } from 'framework7-svelte';

    import {sveltePresets, svelteSelected, svelteSelectedTitle} from "../js/svelteStore.js"
    import {ControlValue} from "../js/led/ControlValue.js";
    import {ControlColor} from "../js/led/ControlColor.js";
    import {runnerBrowser} from "../js/RunnerBrowser.js";


    let presets=[]

    let currentAnimationName="";
    svelteSelected.subscribe(selected=>
    {
            if (currentAnimationName!=selected.animationName) {
                //make sure presets is cleared, otherwise svelte incorrectly updates sliders in some cases
                currentAnimationName = selected.animationName
                presets = []
            }
    })

    function onSave()
    {
        if ($svelteSelected.presetName)
        {
            runnerBrowser.presetSave()
        }
        else
            onCopy()

    }

    function onDelete()
    {

    }
    function onCopy()
    {

    }

</script>
