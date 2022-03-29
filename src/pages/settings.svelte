<Page name="settings">
  <Navbar title="Settings" />

  {#each $sveltePresets as preset, i}
    {#if preset instanceof ControlValue }
      <BlockTitle>{preset.name}</BlockTitle>
      <Block inset>
        <Range value="{preset.value}" min="{preset.min}" max="{preset.max}" step="{preset.step}" scale="true" scaleSteps=5 label=true
               on:rangeChange={ e=> { preset.value=e.detail[0] } } />
      </Block>
    {/if}
  {:else}
    leeg??
  {/each}


</Page>
<script>
  import {
    Page,
    Navbar,
    List,
    ListInput,
    ListItem,
    Toggle,
    BlockTitle,
    Row,
    Button,
    Range,
    Block, BlockFooter
  } from 'framework7-svelte';

  import {sveltePresets, svelteAnimationName} from "../js/svelteStore.js"
  import {ControlValue} from "../js/led/ControlValue.js";


</script>
