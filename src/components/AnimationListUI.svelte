<script lang="ts">
    import {TreeviewItem} from "framework7-svelte"
    import {AnimationList} from "../../ledder/AnimationLists.js"
    import PresetListItem from "@/components/PresetListItem.svelte"

    export let animationList: AnimationList

</script>


{#each animationList as animationListItem}
    <!-- recurse-->
    {#if animationListItem.animationList !== undefined}
        <TreeviewItem
                label={animationListItem.name}
                opened={true}
                toggle={true}
                itemToggle
        >
            <svelte:self
                    animationList={animationListItem.animationList}
            />
        </TreeviewItem>
        <!--animationlist leaf-->
    {:else}

        <TreeviewItem
                label="{animationListItem.name}"
                opened={true}
                toggle={true}
                itemToggle

        >
            {#each animationListItem.presets as presetListItem}
                <PresetListItem presetListItem={presetListItem}></PresetListItem>
            {/each}

        </TreeviewItem>
    {/if}
{/each}
