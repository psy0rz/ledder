<script lang="ts">
    import {type AnimationListType} from "../../ledder/AnimationListTypes.js"
    import PresetListItem from "./PresetListItem.svelte"
    import {TreeviewItem} from "framework7-svelte"

    export let animationList: AnimationListType

</script>

{#each animationList as animationListItem (animationListItem.name)}
    <!-- recurse-->
    {#if animationListItem.animationList !== undefined}
        <TreeviewItem
                label={animationListItem.name}
                opened={true}
                toggle={true}
                itemToggle
                iconMaterial="folder"

        >
            <svelte:self
                    animationList={animationListItem.animationList}
            />
        </TreeviewItem>
        <!--animationlist leaf-->
    {:else}

        {#if animationListItem.presets.length === 1}
                    <PresetListItem parentName={animationListItem.name} presetListItem={animationListItem.presets[0]}></PresetListItem>
        {:else}
            <TreeviewItem
                    label="{animationListItem.name}"
                    opened={true}
                    toggle={true}
                    itemToggle
                    iconMaterial="collections"

            >
                {#each animationListItem.presets as presetListItem ( animationListItem.name+presetListItem.name+presetListItem.previewFile)}
                    <PresetListItem parentName={animationListItem.name} presetListItem={presetListItem}></PresetListItem>
                {/each}

            </TreeviewItem>
        {/if}

    {/if}
{/each}
