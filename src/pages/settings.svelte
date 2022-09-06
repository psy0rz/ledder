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

    import ControlGroup from "../components/ControlGroup.svelte";
    import { ControlGroup as ControlGroupLedder } from "../js/ledder/ControlGroup";
    import { rpc } from "../js/web/RpcClient.js";

    let saveDisabled, copyDisabled, deleteDisabled;
    export let settings = new ControlGroupLedder();

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

<Page
    name="settings"
    on:pageAfterIn={async () => {
        settings = await rpc.request("settings.get");
    }}
>
    <Navbar title="Settings" backLink="Back">
        <Subnavbar>
            <Menu class="color-theme-red">
                <MenuItem
                    iconMd="material:save"
                    onClick={onSave}
                    disabled={saveDisabled}
                />
                <MenuItem
                    iconMd="material:undo"
                    onClick={onDelete}
                    disabled={deleteDisabled}
                />
            </Menu>
        </Subnavbar>
    </Navbar>
    <Block strong>
        <Treeview>
            <ControlGroup
                controlGroup={settings}
                onChanged={(path, values) => {
                    rpc.notify("settings.updateValue", path, values);
                }}
            />
        </Treeview>
    </Block>
</Page>
