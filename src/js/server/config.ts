import {copyFile} from "fs/promises"
import {access} from "fs/promises"

const conf_file = 'displayconf.js'
const conf_file_example = 'displayconf-example.js'

async function load() {

    //creat default config
    await access(conf_file).catch(async () => {
        await copyFile(conf_file_example, conf_file)
    })

    return (import("../../../"+conf_file))
}

export const config = await load()


