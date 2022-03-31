<Page name="settings" on:pageTabShow={ e=> { presets=$sveltePresets} }>
    <Navbar title="Controls"
            subtitle={$svelteSelectedTitle}

    >

        <Subnavbar>
            <Menu class="color-theme-red" >

                <MenuItem class="color-theme-red" iconMd="material:save" onClick={ onSave } disabled={saveDisabled}/>
                <MenuItem iconMd="material:delete" onClick={ onDelete } disabled={deleteDisabled }/>
                <MenuItem iconMd="material:file_copy" onClick={ onSaveAs } disabled={copyDisabled }/>
            </Menu>

        </Subnavbar>

    </Navbar>

<!--    <Toolbar position="top">-->
<!--        <Button iconMd="material:save" onClick={ onSave } disabled={saveDisabled}/>-->
<!--        <Button iconMd="material:delete" onClick={ onDelete } disabled={deleteDisabled }/>-->
<!--        <Button iconMd="material:file_copy" onClick={ onSaveAs } disabled={copyDisabled }/>-->
<!--    </Toolbar>-->


    {#each presets as preset, i (preset.name)}
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
        Block, Input, Stepper, Button, Toolbar, Icon, Link, NavRight, f7, Menu, MenuItem, Subnavbar
    } from 'framework7-svelte';

    import {sveltePresets, svelteSelectedAnimationName, svelteSelectedTitle} from "../js/svelteStore.js"
    import {ControlValue} from "../js/led/ControlValue.js";
    import {ControlColor} from "../js/led/ControlColor.js";
    import {runnerBrowser} from "../js/RunnerBrowser.js";


    let presets = []
    let button
    let saveDisabled, copyDisabled, deleteDisabled;

    svelteSelectedAnimationName.subscribe(selected => {
        // make sure to clear the list on animation change to net get confused
        presets = []
    })


    async function onSave() {
        await runnerBrowser.presetSave()

    }

    async function onDelete() {
        await runnerBrowser.presetDelete()
        f7.tab.show('#view-categories')

    }

    async function onSaveAs() {
        await runnerBrowser.presetSave(true)

    }

</script>
