<script lang="ts">
    import {TreeviewItem} from "framework7-svelte"
    import {PresetListItem} from "../../ledder/AnimationLists.js"

    export let presetListItem: PresetListItem
    export let parentName: string

    let label=parentName
    let icon="image"

    if (presetListItem.name!=='default') {
        label = label + ": " + presetListItem.name
        icon="photo_album"
    }


</script>


<TreeviewItem
        label={label}
        opened={true}
        toggle={false}
        itemToggle
        iconMaterial={icon}


>


    <img class="ledder-preview-image" alt="{presetListItem.name}" slot="media" src="{presetListItem.previewFile}"/>

</TreeviewItem>
