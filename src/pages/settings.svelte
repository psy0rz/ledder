<script>
    import {Block, Navbar, Page, Treeview,} from "framework7-svelte"

    import ControlGroup from "../../ledder/ControlGroup"
    import {rpc} from "../js/web/RpcClient.js"
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
        settings = await rpc.request("getSettings");
    }}
>
    <Navbar title="Settings" backLink="Back">
<!--        <Subnavbar>-->
<!--                <Button-->
<!--                    iconMd="material:save"-->
<!--                    onClick={onSave}-->
<!--                    disabled={saveDisabled}-->
<!--                    tonal-->
<!--                />-->
<!--                <Button-->
<!--                    iconMd="material:undo"-->
<!--                    onClick={onDelete}-->
<!--                    disabled={deleteDisabled}-->
<!--                    tonal-->
<!--                />-->
<!--        </Subnavbar>-->
    </Navbar>
    <Block strong>
        <Treeview>
            <ControlGroupUI
                controlGroup={settings}
                onChanged={(path, values) => {
                    rpc.notify("updateSetting", path, values);
                }}
            />
        </Treeview>
    </Block>
</Page>
