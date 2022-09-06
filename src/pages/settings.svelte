<script>
    import {
        Page,
        Navbar,
        BlockTitle,
        Treeview,
        TreeviewItem,
        Range,
        Block,
        Input,
        Stepper,
        Menu,
        MenuItem,
        Subnavbar,
        Toggle,
        Checkbox,
    } from "framework7-svelte";

    import {
        sveltePresets,
        svelteSelectedAnimationName,
        svelteSelectedTitle,
        svelteLive,
    } from "../js/web/svelteStore.js";
    import { runnerBrowser } from "../js/web/RunnerBrowser.js";
    import ControlGroup from "../components/ControlGroup.svelte";

    let geert = true;

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
                    class={$svelteLive ? "disabled" : ""}
                    onClick={() => runnerBrowser.send()}
                />
            </Menu>
        </Subnavbar>
    </Navbar>
    <Block strong>
        <Treeview>
            <ControlGroup controlGroup={$sveltePresets} />
        </Treeview>
    </Block>
</Page>
