// import {JSONFile} from "lowdb/lib/adapters/node/JSONFile.js"

//NOTE: GUI is still WIP, but if you edit devices.json and update the timestamp it should work. :)
import {Low} from "lowdb"
import {JSONFile} from 'lowdb/node'

export type DisplayDeviceInfo =
    {
        id?: string,
        name: string,
        timestamp: number,
        animation: string,
        frames: number
    }

export type DisplayDeviceInfoDb = Record<string, DisplayDeviceInfo>

export type DisplayDeviceInfoList=Array<DisplayDeviceInfo>

export class DisplayDeviceStore {
    private db: Low<DisplayDeviceInfoDb>

    constructor() {
// Configure lowdb to write data to JSON file
        const adapter = new JSONFile<DisplayDeviceInfoDb>("devices.json")
        const defaultData = {}
        this.db = new Low(adapter, defaultData)


    }

    async read() {
        await this.db.read()

    }

    async get(id: string): Promise<DisplayDeviceInfo> {
        await this.db.read()

        if (id in this.db.data)
            return (this.db.data[id])


        //defaults
        let newDev = {
            name: id,
            timestamp: 0,
            animation: "",
            frames: 60*60
        }

        await this.write(id, newDev)

        return newDev

    }


    async delete(id: string) {
        delete this.db.data[id]
        await this.db.write()

    }


    async write(id: string, deviceInfo: DisplayDeviceInfo) {

        this.db.data[id] = deviceInfo
        await this.db.write()
    }

    async list():Promise<DisplayDeviceInfoList> {

        return Object.keys(this.db.data).map(key => ({id: key, ...this.db.data[key]}))

    }

}

export let displayDeviceStore = new DisplayDeviceStore()
displayDeviceStore.read()
