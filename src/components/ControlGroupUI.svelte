<script lang="ts">
    import ControlValueUI from "./ControlValueUI.svelte"
    import {BlockHeader, Checkbox, Toggle, TreeviewItem} from "framework7-svelte"
    import ControlGroup from "../../ledder/ControlGroup.js"
    import ControlColorUI from "./ControlColorUI.svelte"
    import ControlInputUI from "./ControlInputUI.svelte"
    import ControlSwitchUI from "./ControlSwitchUI.svelte"
    import ControlSelectUI from "./ControlSelectUI.svelte"
    import ControlRangeUI from "./ControlRangeUI.svelte"

    export let controlGroup: ControlGroup
    export let path: Array<string> = []
    export let onChanged: (path: Array<string>, values: {}) => void


    // let subControlGroup:ControlGroup=undefined;
</script>

{#each Object.values(controlGroup.meta.controls) as control, i (control.meta.name)}
    {#if control.meta.type === "controls"}
        <!-- Recruse into a nested ControlGroup -->
        <TreeviewItem
                label={control.meta.name}
                opened={!(control as ControlGroup).meta.collapsed}
                toggle={true}
                itemToggle
                class="{control.meta.enabled ?'':'disabled'}"
                iconMaterial="{control.meta.switchable?'':'folder'}"

        >
            <span slot="content-start">
                {#if control.meta.switchable}
                    <ControlSwitchUI
                            control={control}
                            path={[...path, control.meta.name]}
                            onChanged={onChanged}
                    />
                {/if}
            </span>

            <svelte:self
                    controlGroup={control}
                    path={[...path, control.meta.name]}
                    onChanged={onChanged}
            />
        </TreeviewItem>
    {:else}
        <TreeviewItem opened toggle={false} class="{control.meta.enabled&&controlGroup.enabled!==false?'':'disabled'}">
            <span slot="content" class="padding-bottom">
                <BlockHeader>{control.meta.name}:</BlockHeader>
                {#if control.meta.type === "value"}
                    <ControlValueUI
                            control={control}
                            path={[...path, control.meta.name]}
                            onChanged={onChanged}
                    />
                {:else if control.meta.type === "range"}
                    <ControlRangeUI
                            control={control}
                            path={[...path, control.meta.name]}
                            onChanged={onChanged}
                    />
                {:else if control.meta.type === "color"}
                    <ControlColorUI
                            control={control}
                            path={[...path, control.meta.name]}
                            onChanged={onChanged}
                    />
                {:else if control.meta.type === "input"}
                    <ControlInputUI
                            control={control}
                            path={[...path, control.meta.name]}
                            onChanged={onChanged}
                    />
                {:else if control.meta.type === "switch"}
                    <ControlSwitchUI
                            control={control}
                            path={[...path, control.meta.name]}
                            onChanged={onChanged}
                    />
                {:else if control.meta.type === "select"}
                    <ControlSelectUI
                            control={control}
                            path={[...path, control.meta.name]}
                            onChanged={onChanged}
                    />
                {:else}
                    <b
                    >Unknown control type: {control.meta.name} has type '{control.meta.type}' !</b>
                {/if}
            </span>
        </TreeviewItem>
    {/if}
{/each}
