<script lang="ts">
    import {Block, BlockHeader, TreeviewItem} from "framework7-svelte"
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
        >
            <svelte:self
                    animationList={animationListItem.animationList}
            />
        </TreeviewItem>
    {:else}
        <TreeviewItem
                opened
                toggle={false}
        >
            <span slot="content" class="padding-bottom">
                <Block>block</Block>
            </span>

        </TreeviewItem>
    {/if}
{/each}
