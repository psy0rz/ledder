<script lang="ts">
    import {BlockHeader, TreeviewItem} from "framework7-svelte"
    import {AnimationList} from "../../ledder/AnimationLists.js"

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
                iconMaterial="folder"
        >
            <span slot="content" class="padding-bottom">
            <BlockHeader class="">{animationListItem.name}:</BlockHeader>
            </span>
            <svelte:self
                    animationList={animationListItem.animationList}
            />
        </TreeviewItem>
    {:else}
        <TreeviewItem opened toggle={false} label={animationListItem.name}>

        </TreeviewItem>
    {/if}
{/each}
