<script lang="ts">
    import {TreeviewItem} from "framework7-svelte"
    import {PresetListItem} from "../../ledder/AnimationLists.js"
    import {runnerBrowser} from "@/js/web/RunnerBrowser.js"

    export let presetListItem: PresetListItem
    export let parentName: string

    let label=parentName.replace(RegExp(".*/"),"")
    let icon="image"

    if (presetListItem.name!=='default') {
        // label = label + ": " + presetListItem.name
        label =  presetListItem.name
        icon="photo_album"
    }


</script>


<TreeviewItem
        label={label}
        opened={true}
        toggle={false}
        iconMaterial={icon}
        on:click={runnerBrowser.run(parentName, presetListItem.name)}


>


    <img class="ledder-preview-image" alt="{presetListItem.name}" slot="media" src="{presetListItem.previewFile}"/>

</TreeviewItem>
