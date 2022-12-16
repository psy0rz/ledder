<script lang="ts">
    import {TreeviewItem} from "framework7-svelte"
    import {PresetListItem} from "../../ledder/AnimationLists.js"

    export let presetListItem: PresetListItem


</script>


<TreeviewItem
        label={presetListItem.name}
        opened={true}
        toggle={false}
        itemToggle
        iconMaterial="turned_in"

>

    <img class="ledder-preview-image" alt="{presetListItem.name}" slot="media" src="{presetListItem.previewFile}"/>

</TreeviewItem>
