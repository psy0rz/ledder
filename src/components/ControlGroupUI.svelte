<script lang="ts">
    import ControlValueUI from "./ControlValueUI.svelte"
    import {BlockHeader, Checkbox, Toggle, TreeviewItem} from "framework7-svelte"
    import ControlGroup from "../../ledder/ControlGroup.js"
    import ControlColorUI from "./ControlColorUI.svelte"
    import ControlInputUI from "./ControlInputUI.svelte"
    import ControlSwitchUI from "./ControlSwitchUI.svelte"
    import ControlSelectUI from "./ControlSelectUI.svelte"
    import ControlRangeUI from "./ControlRangeUI.svelte"
    import { onMount } from 'svelte'

    export let controlGroup: ControlGroup
    export let path: Array<string> = []
    export let onChanged: (path: Array<string>, values: {}) => void

    let elementMap = new Map<string, HTMLElement>()
    
    function registerElement(element: HTMLElement, controlName: string) {
        elementMap.set(controlName, element)
        return {
            destroy() {
                elementMap.delete(controlName)
            }
        }
    }

    onMount(() => {
        // Wait for Framework7 to initialize all components
        setTimeout(() => {
            // Programmatically close groups that should be collapsed
            Object.values(controlGroup.meta.controls).forEach((control) => {
                if (control.meta.type === 'controls' && control.meta.collapsed) {
                    const element = elementMap.get(control.meta.name)
                    if (element) {
                        const treeviewItem = element.closest('.treeview-item')
                        if (treeviewItem && treeviewItem.classList.contains('treeview-item-opened')) {
                            const toggle = treeviewItem.querySelector('.treeview-toggle')
                            if (toggle) {
                                (toggle as HTMLElement).click()
                            }
                        }
                    }
                }
            })
        }, 200)
    })
</script>

{#each Object.values(controlGroup.meta.controls) as control, i (control.meta.name)}
    {#if control.meta.type === "controls"}
        <!-- Recurse into a nested ControlGroup -->
        <div use:registerElement={control.meta.name}>
            <TreeviewItem
                    label={control.meta.name}
                    opened={true}
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
        </div>
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
