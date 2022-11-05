export type PresetListItem =
    {
        name: string,
        title: string,
        description: string,
        previewFile: string
    }

export type PresetList = Array<PresetListItem>

export type AnimationListItem = {
    name: string,
    title: string,
    description: string,
    presets: PresetList,
}

//list with animations, recursive
export type AnimationList = Array<AnimationListItem | AnimationListDir>

//subdirectory with animations
export type AnimationListDir =
    {
        name: string,
        animationList: AnimationList
    }

