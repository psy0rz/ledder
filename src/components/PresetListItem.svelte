<script lang="ts">
    import {TreeviewItem} from "framework7-svelte"
    import {type PresetListItemType} from "../../ledder/AnimationListTypes.js"
    import {runnerBrowser} from "@/js/web/RunnerBrowser.js"
    import {externalizeLinks} from "@/js/web/util.js"

    export let presetListItem: PresetListItemType
    export let parentName: string
    export let animationDescription: string = ""

    let label=parentName.replace(RegExp(".*/"),"")
    let icon="image"

    if (presetListItem.name!=='default') {
        // label = label + ": " + presetListItem.name
        label =  presetListItem.name
        icon="photo_album"
    }

</script>


<TreeviewItem
        opened={true}
        toggle={false}
        iconMaterial={icon}
        on:click={()=>{runnerBrowser.run(parentName, presetListItem.name)}}


>

    <div slot="label" class="ledder-animation-label">
        <span>{label}</span>
        {#if animationDescription}
            <div class="ledder-animation-description">{@html externalizeLinks(animationDescription)}</div>
        {/if}
    </div>

    <img class="ledder-preview-image" alt="{presetListItem.name}" slot="media" loading="lazy" decoding="async" src="{presetListItem.previewFile}"/>

</TreeviewItem>
