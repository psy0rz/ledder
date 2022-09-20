<script>
    import {
        Page,
        Navbar,
        Treeview,
        Block,
        Menu,
        MenuItem,
        Subnavbar,


    } from "framework7-svelte";

    import {
        sveltePresets,
        svelteSelectedTitle,
        svelteLive,
    } from "../js/web/svelteStore.js";
    import { runnerBrowser } from "../js/web/RunnerBrowser.js";
    import ControlGroup from "../components/ControlGroup.svelte";
    import {rpc} from "../js/web/RpcClient.js";


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
    <Navbar title="Controls" subtitle={$svelteSelectedTitle} backLink="Back">
        <Subnavbar>
            <Menu class="color-theme-red">
                <MenuItem
                    iconMd="material:save"
                    onClick={onSave}
                    disabled={saveDisabled}
                />
                <MenuItem
                    iconMd="material:delete"
                    onClick={onDelete}
                    disabled={deleteDisabled}
                />
                <MenuItem
                    iconMd="material:file_copy"
                    onClick={onSaveAs}
                    disabled={copyDisabled}
                />
                <MenuItem
                    iconMd="material:upload"
                    title="Activate animation"
                    onClick={() => runnerBrowser.send()}
                />
            </Menu>
        </Subnavbar>
    </Navbar>
    <Block strong>
        <Treeview>
            <ControlGroup
                controlGroup={$sveltePresets}
                onChanged={(path, values) => {
                    rpc.notify("display.control.updateValue", path, values);
                }}
            />
        </Treeview>
    </Block>
</Page>
