{#each Object.values(controls.meta.controls) as control, i (control.meta.name)}
    <TreeviewItem label="{control.meta.name}" opened={true} toggle={true} itemToggle>

        <TreeviewItem opened toggle={false}>

                  <span slot="content" class="padding-bottom">

                      {#if control.meta.type === 'value' }
                            valueding
                      {:else if control.meta.type === 'controls'}
                          <svelte:self controls={control}/>

                      {/if}

                  </span>
        </TreeviewItem>
    </TreeviewItem>
{/each}

<script>
    export let controls;
    import {TreeviewItem} from "framework7-svelte";

</script>
