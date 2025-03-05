<script>
    import {Block, Navbar, NavTitle, Page, Treeview,} from "framework7-svelte"

    import ControlGroup from "../../ledder/ControlGroup"
    import {rpc} from "../js/web/RpcClient.js"
    import ControlGroupUI from "../components/ControlGroupUI.svelte"
    import {svelteSelectedDisplayId} from "@/js/web/svelteStore.js";

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
    on:pageBeforeIn={async () => {
        settings = await rpc.request("getSettings");
    }}
>
    <Navbar backLink="Back">
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
        <NavTitle title="Display settings" subtitle="id={$svelteSelectedDisplayId}"></NavTitle>


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
