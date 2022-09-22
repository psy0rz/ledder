<script lang="ts">
    import ControlValue from "./ControlValueUI.svelte";

    export let controlGroup: ControlGroup;
    export let path: Array<string> = [];
    export let onChanged: (path: Array<string>, values: {}) => void;

    import { BlockHeader, TreeviewItem } from "framework7-svelte";
    import { ControlGroup } from "../js/ledder/ControlGroup.js";
    import ControlColorUI from "./ControlColorUI.svelte";
    import ControlInputUI from "./ControlInputUI.svelte";
    import ControlSwitchUI from "./ControlSwitchUI.svelte";
    import ControlSelectUI from "./ControlSelectUI.svelte";

    //TODO: like this? https://svelte.dev/tutorial/svelte-component
</script>

{#each Object.values(controlGroup.meta.controls) as control, i (control.meta.name)}
    {#if control.meta.type === "controls"}
        <TreeviewItem
            label={control.meta.name}
            opened={!control.meta.collapsed}
            toggle={true}
            itemToggle
            iconMaterial="folder"
        >
            <svelte:self
                controlGroup={control}
                path={[...path, control.meta.name]}
                onChanged={onChanged}
            />
        </TreeviewItem>
    {:else}
        <TreeviewItem opened toggle={false}>
            <span slot="content" class="padding-bottom">
                <BlockHeader class="">{control.meta.name}:</BlockHeader>
                {#if control.meta.type === "value"}
                    <ControlValue
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
                        >Unknown control type: {control.meta.name} has type '{control
                            .meta.type}' !</b
                    >
                {/if}
            </span>
        </TreeviewItem>
    {/if}
{/each}
