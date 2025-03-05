import {copyFile} from "fs/promises"
import {access} from "fs/promises"

const conf_file = 'displayconf.js'
const conf_file_example = 'displayconf-example.js'

export let config:any = {}

export async function loadDisplayconf() {

    //creat default config
    await access(conf_file).catch(async () => {
        console.warn(`${conf_file} not found, copying from ${conf_file_example}...`)
        await copyFile(conf_file_example, conf_file)
    })

    console.log(`Loading ${conf_file}...`)
    config = await import("../../" + conf_file)
}

