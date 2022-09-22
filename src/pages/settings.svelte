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

    import ControlGroup from "../../ledder/ControlGroup";
    import { rpc } from "../js/web/RpcClient.js";
    import ControlGroupUI from "../components/ControlGroupUI.svelte"

    let saveDisabled, copyDisabled, deleteDisabled;
    export let settings = new ControlGroup();

    async function onSave() {
        // await runnerBrowser.presetSave();
    }

    async function onDelete() {
        // await runnerBrowser.presetDelete();
        // f7router.back();
    }

    async function onSaveAs() {
        // await runnerBrowser.presetSave(true);
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
            <ControlGroupUI
                controlGroup={settings}
                onChanged={(path, values) => {
                    rpc.notify("settings.updateValue", path, values);
                }}
            />
        </Treeview>
    </Block>
</Page>
