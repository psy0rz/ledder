{#each Object.values(controls.meta.controls) as control, i (control.meta.name)}
    {#if control.meta.type === 'controls'}
        <TreeviewItem label="{control.meta.name}" opened={true} toggle={true} itemToggle>
            <svelte:self controls={control}/>
        </TreeviewItem>
    {:else}
        <TreeviewItem opened toggle={false} label="{control.meta.name}">
        <span slot="content" class="padding-bottom">
            {#if control.meta.type === 'value' }
                valueding
            {/if}
        </span>
        </TreeviewItem>
    {/if}
{/each}

<script>
    export let controls;
    import {TreeviewItem} from "framework7-svelte";

</script>
