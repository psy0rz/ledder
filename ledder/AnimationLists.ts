//animation and preset tree structure

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

//subdirectory with animations
export type AnimationListDir =
    {
        name: string,
        animationList: AnimationList
    }

//list with animations, recursive. this is the root of a tree element as well.
export type AnimationList = Array<AnimationListItem | AnimationListDir>
