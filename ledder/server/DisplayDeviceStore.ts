import {readFile, rm, writeFile} from "fs/promises"

export type DisplayDeviceInfo =
    {
        id: string,
        name: string,
        timestamp: number,
        animation: string
    }


export class DisplayDeviceStore {
    devicePath: string

    constructor(devicePath: string = "devices") {
        this.devicePath = devicePath


    }

    deviceFileName(id: string) {
        let strippedId = id.replace(/[^a-zA-Z0-9:]/g, '')

        return (`${this.devicePath}/${strippedId}.json`)
    }

    async load(id: string): Promise<DisplayDeviceInfo> {

        try {
            return JSON.parse(await readFile(this.deviceFileName(id), 'utf8'))
        } catch (e) {
            //default if doesnt exist
            let newDevice= {
                name: id,
                id: id,
                timestamp: 0,
                animation: ""
            }

            await this.save(newDevice)
            return newDevice

        }

    }

    async delete(id: string) {
        await rm(this.deviceFileName(id))

    }


    async save(deviceInfo: DisplayDeviceInfo) {

        await writeFile(
            this.deviceFileName(deviceInfo.id),
            JSON.stringify(deviceInfo, undefined, ' '), 'utf8'
        )
    }

}

export let displayDeviceStore=new DisplayDeviceStore()