{#each Object.values(controls.meta.controls) as control, i (control.meta.name)}
    {#if control.meta.type === 'controls'}
        <TreeviewItem label="{control.meta.name}" opened={true} toggle={true} itemToggle iconMaterial="folder">
            <svelte:self controls={control}/>
        </TreeviewItem>
    {:else}
        <TreeviewItem opened toggle={false} >

        <span slot="content" class="padding-bottom">
            <BlockHeader class="">{control.meta.name}:</BlockHeader>
            {#if control.meta.type === 'value' }
                <ControlValue control={control}/>
            {/if}
        </span>
        </TreeviewItem>
    {/if}
{/each}

<script lang="ts">
    import ControlValue from "./ControlValue.svelte";

    export let controls:Controls;
    import {BlockHeader, BlockTitle, TreeviewItem} from "framework7-svelte";
    import {Controls} from "../js/ledder/Controls.js";


</script>
