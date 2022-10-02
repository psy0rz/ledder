
//list with presets
export type PresetList= Array<{
    name: string,
    title: string,
    description: string,
    previewFile: string
}>


//list with animations, recursive
export type AnimationList = Array<{
    name: string,
    title: string,
    description: string,
    presets: PresetList,
} | AnimationDir>

//subdirectory with animations
export type AnimationDir =
    {
        name: string,
        entries: AnimationList
    }

