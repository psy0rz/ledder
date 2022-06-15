{#each Object.values(controlGroup.meta.controls) as control, i (control.meta.name)}

    {#if control.meta.type === 'controls'}
        <TreeviewItem label="{control.meta.name}" opened={true} toggle={true} itemToggle iconMaterial="folder">
            <svelte:self controlGroup={control} path={[...path,control.meta.name]} />
        </TreeviewItem>

    {:else}
        <TreeviewItem opened toggle={false} >

        <span slot="content" class="padding-bottom">
            <BlockHeader class="">{control.meta.name}:</BlockHeader>
            {#if control.meta.type === 'value' }
                <ControlValue control={control} path={[...path,control.meta.name]}/>
            {/if}
        </span>
        </TreeviewItem>
    {/if}

{/each}

<script lang="ts">
    import ControlValue from "./ControlValue.svelte";

    export let controlGroup:ControlGroup;
    export let path:[]=[];
    import {BlockHeader, BlockTitle, TreeviewItem} from "framework7-svelte";
    import {ControlGroup} from "../js/ledder/ControlGroup.js";


</script>
