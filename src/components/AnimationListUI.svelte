<script lang="ts">
    import {TreeviewItem} from "framework7-svelte"
    import {AnimationList} from "../../ledder/AnimationLists.js"
    import PresetListItem from "./PresetListItem.svelte"

    export let animationList: AnimationList

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
