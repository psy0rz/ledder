<script>
    import {Block, Button, Navbar, NavLeft, NavTitle, Page, Subnavbar, Treeview,} from "framework7-svelte"

    import {svelteLive, sveltePresets, svelteSelectedTitle,} from "../js/web/svelteStore.js"
    import {runnerBrowser} from "../js/web/RunnerBrowser.js"
    import ControlGroup from "../components/ControlGroupUI.svelte"
    import {rpc} from "../js/web/RpcClient.js"
    import {svelteStats} from "@/js/web/svelteStore.js";


    // let presets = []
    let button;
    let saveDisabled, copyDisabled, deleteDisabled;

    export let f7router;

    // svelteSelectedAnimationName.subscribe(() => {
    //     // make sure to clear the list on animation change to net get confused
    //     presets = []
    // })

    async function onSave() {
        await runnerBrowser.presetSave();
    }

    async function onDelete() {
        await runnerBrowser.presetDelete();
        f7router.back();
    }

    async function onSaveAs() {
        await runnerBrowser.presetSave(true);
    }
</script>

<Page name="controls" on:pageMounted={() => {}}>
    <Navbar backLink="Back">
        <NavLeft>

            <Button iconMd="material:menu"
                    panelOpen="left"/>

            <Button
                    iconMd="material:save"
                    onClick={onSave}
                    tonal
                    disabled={saveDisabled}
            />
            <Button
                    iconMd="material:delete"
                    onClick={onDelete}
                    disabled={deleteDisabled}
                    tonal
            />
            <Button
                    iconMd="material:file_copy"
                    onClick={onSaveAs}
                    disabled={copyDisabled}
                    tonal
            />
        </NavLeft>
        <NavTitle title="Controls - {$svelteSelectedTitle}" subtitle="{$svelteStats}"></NavTitle>
    </Navbar>
    <Block strong>
        <Treeview>
            <ControlGroup
                    controlGroup={$sveltePresets}
                    onChanged={(path, values) => {
               //         console.log(path, values)
                    rpc.notify("updateValue", path, values, $svelteLive);
                }}
            />
        </Treeview>
    </Block>
</Page>
