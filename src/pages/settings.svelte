<Page name="settings"
      on:pageMounted={ ()=> {

      }

     }


>
    <Navbar title="Controls"
            subtitle={$svelteSelectedTitle}
            backLink="Back"

    >

        <Subnavbar>
            <Menu class="color-theme-red">

                <MenuItem iconMd="material:save" onClick={ onSave } disabled={saveDisabled}/>
                <MenuItem iconMd="material:delete" onClick={ onDelete } disabled={deleteDisabled }/>
                <MenuItem iconMd="material:file_copy" onClick={ onSaveAs } disabled={copyDisabled }/>
                <MenuItem iconMd="material:upload" title="Activate animation" class={$svelteLive?'disabled':''}
                          onClick={ ()=> runnerBrowser.send()  }/>
                <MenuItem iconMd="material:save" onClick={ ()=>{
                    console.log("sdf")
                    rpc.request("runner.runName", "PoliceLights", "");


                 } } />
            </Menu>

        </Subnavbar>

    </Navbar>


    {#each $sveltePresets as preset, i (preset.meta.name)}
        <BlockTitle>{preset.meta.name}</BlockTitle>
        <Block inset>
            {#if preset.meta.type === 'value' }
                <Stepper
                        bind:value={preset.value}
                        min={preset.meta.min}
                        max={preset.meta.max}
                        step={preset.meta.step}
                />
                <Range bind:value={preset.value}
                       min={preset.meta.min}
                       max={preset.meta.max}
                       step={preset.meta.step}
                       scaleSteps={5}
                       scaleSubSteps={5}
                       scale
                       label={true}
                       on:rangeChange={ e=> {
                           preset.value=e.detail[0]
                           rpc.notify("matrix.control.updateValue", preset.meta.name, preset)
                       } }/>
            {:else if preset.meta.type === 'color'}
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

                                    rpc.notify("matrix.control.updateValue", preset.meta.name, preset)
                                }
                            }
                        }}

                />
            {:else if preset.meta.type === 'input'}
                <Input type="textarea" value={preset.text}
                       on:input={ (e)=>{
                            preset.text=e.detail[0].target.value
                            rpc.notify("matrix.control.updateValue", preset.meta.name, preset)
                       }}
                />
            {:else if preset.meta.type === 'switch'}
                <Toggle checked={preset.enabled} on:toggleChange={ (e)=>
                {
                    preset.enabled=e.detail[0]
                    rpc.notify("matrix.control.updateValue", preset.meta.name, preset)
                }}/>
            {:else if preset.meta.type === 'select'}
                <Input
                        type="select"
                        label="Select"
                        value={ preset.selected }
                        on:input={ (e)=>{
                            console.log(e)
                            preset.selected=e.detail[0].target.value
                            rpc.notify("matrix.control.updateValue", preset.meta.name, preset)
                       }}

                >
                    {#each preset.meta.choices as choice}
                        <option value="{choice.id}">{choice.name}</option>
                    {/each}
                </Input>

            {:else}
                <b>Unknown control type: {preset.meta.name} has type {preset.meta.type} !</b>
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
        Block, Input, Stepper, Menu, MenuItem, Subnavbar, Toggle,
    } from 'framework7-svelte';

    import {sveltePresets, svelteSelectedAnimationName, svelteSelectedTitle, svelteLive} from "../js/web/svelteStore.js"
    import {runnerBrowser} from "../js/web/RunnerBrowser.js";
    import {rpc} from "../js/web/RpcClient.js";
    import {tick} from "svelte";


    // let presets = []
    let button
    let saveDisabled, copyDisabled, deleteDisabled;

    export let f7router

    // svelteSelectedAnimationName.subscribe(() => {
    //     // make sure to clear the list on animation change to net get confused
    //     presets = []
    // })

    async function onSave() {
        await runnerBrowser.presetSave()

    }

    async function onDelete() {
        await runnerBrowser.presetDelete()
        f7router.back()

    }

    async function onSaveAs() {
        await runnerBrowser.presetSave(true)

    }

</script>
