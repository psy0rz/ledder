// import {JSONFile} from "lowdb/lib/adapters/node/JSONFile.js"
import {Low} from "lowdb"
import {JSONFile} from 'lowdb/node'
import path from "path"
import glob from "glob-promise"

export type DisplayDeviceInfo =
    {
        id?: string,
        name: string,
        timestamp: number,
        animation: string
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

        if (id in this.db.data)
            return (this.db.data[id])


        //defaults
        let newDev = {
            name: id,
            timestamp: 0,
            animation: ""
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
