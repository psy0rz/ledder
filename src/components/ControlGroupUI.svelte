<script lang="ts">
    import ControlValueUI from "./ControlValueUI.svelte"
    import {BlockHeader, Checkbox, f7, Toggle, TreeviewItem} from "framework7-svelte"
    import ControlGroup from "../../ledder/ControlGroup.js"
    import ControlColorUI from "./ControlColorUI.svelte"
    import ControlInputUI from "./ControlInputUI.svelte"
    import ControlSwitchUI from "./ControlSwitchUI.svelte"
    import ControlSelectUI from "./ControlSelectUI.svelte"
    import ControlRangeUI from "./ControlRangeUI.svelte"

    export let controlGroup: ControlGroup
    export let path: Array<string> = []
    export let onChanged: (path: Array<string>, values: {}) => void

    //Whether each sub group is currently unfolded, starting at the animation's collapsed default.
    //The control tree is re-rendered whenever an animation adds controls, so we have to remember
    //what the user opened or closed by hand, otherwise those groups fold back to the default.
    let openedByGroupName = new Map<string, boolean>()

    function isOpened(subGroup: ControlGroup): boolean {
        if (!openedByGroupName.has(subGroup.meta.name))
            openedByGroupName.set(subGroup.meta.name, !subGroup.meta.collapsed)

        return openedByGroupName.get(subGroup.meta.name)
    }

    /**
     * Framework7 sliders can only measure themselves while they are visible: Range.calcSize()
     * bails out on a zero width, which is what a collapsed group (display:none) gives it. So a
     * slider created inside a collapsed group keeps its knob and scale in the wrong place.
     * Re-measure them the moment the group is opened, the same way Framework7 itself does on
     * window resize, tab show and panel/modal open.
     */
    function relayoutSlidersIn(groupElement: HTMLElement) {
        groupElement.querySelectorAll('.range-slider').forEach((sliderElement) => {
            const slider = f7.range.get(sliderElement)
            if (slider) {
                slider.calcSize()
                slider.layout()
            }
        })
    }
</script>

{#each Object.values(controlGroup.meta.controls) as control, i (control.meta.name)}
    {#if control.meta.type === "controls" && control.meta.inline}
        <!-- Inline ControlGroup: only used to keep names apart, so dont show it as a level of its own -->
        <svelte:self
                controlGroup={control}
                path={[...path, control.meta.name]}
                onChanged={onChanged}
        />
    {:else if control.meta.type === "controls"}
        <!-- Recurse into a nested ControlGroup -->
        <TreeviewItem
                label={control.meta.name}
                opened={isOpened(control)}
                toggle={true}
                itemToggle
                class="{control.meta.enabled ?'':'disabled'}"
                iconMaterial="{control.meta.switchable?'':'folder'}"
                on:treeviewOpen={(e) => {
                    openedByGroupName.set(control.meta.name, true)
                    relayoutSlidersIn(e.detail[0])
                }}
                on:treeviewClose={() => openedByGroupName.set(control.meta.name, false)}
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
