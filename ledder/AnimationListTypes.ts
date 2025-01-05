
//animation and preset tree structure

export type PresetListItemType =
    {
        name: string,
        title: string,
        description: string,
        previewFile: string
    }

export type PresetListType = Array<PresetListItemType>

export type AnimationListItemType = {
    name: string,
    title: string,
    description: string,
    presets: PresetListType,
}

//subdirectory with animations
export type AnimationListDirType =
    {
        name: string,
        animationList: AnimationListType
    }

//list with animations, recursive. this is the root of a tree element as well.
export type AnimationListType = Array<AnimationListItemType | AnimationListDirType>
