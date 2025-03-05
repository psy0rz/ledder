import {promises as fs} from 'fs';
import * as path from 'path';
import type ControlGroup from "../ControlGroup.js";
import type RenderControl from "./RenderControl.js";
import type {Values} from "../Control.js";
import {DisplayQOIShttp, STREAM_LIVE, STREAM_RECORD, STREAM_REPLAY} from "./drivers/DisplayQOIShttp.js";

const filePath = 'settings.json';

export interface DisplaySettingsI {
    [key: string]: {
        'animationAndPresetPath': string,
        'settingsControl': Values,
        'streamMode': number
    }
}

let timeoutId: NodeJS.Timeout | null = null;

export function saveSettingsDelayed(renderControllers: Array<RenderControl>) {

    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    timeoutId=setTimeout(async () => {
        await saveSettings(renderControllers)
    }, 1000)
}

export async function saveSettings(renderControllers: Array<RenderControl>) {
    let settings: DisplaySettingsI = {}
    for (let renderControl of renderControllers) {

        let streamMode=STREAM_LIVE;

        const display=renderControl.getPrimaryDisplay()

        if (display instanceof DisplayQOIShttp)
        {
            streamMode=display.getStreamMode();
        }

        settings[renderControl.getPrimaryDisplay().id] = {
            'animationAndPresetPath': renderControl.selected(),
            'settingsControl': renderControl.getPrimaryDisplay().settingsControl.save(),
            'streamMode': streamMode
        }
    }
    await writeObjectToFile(settings)
}

export async function loadSettings(renderControllers: Array<RenderControl>) {
    const settings = await readObjectFromFile()
    if (settings) {
        for (let renderControl of renderControllers) {
           const display=renderControl.getPrimaryDisplay()
            if (settings[display.id] !== undefined) {

                const displaySettings = settings[display.id]
                await renderControl.select(displaySettings.animationAndPresetPath, false)
                display.settingsControl.load(displaySettings.settingsControl)
                if (display instanceof DisplayQOIShttp)
                {
                    //dont restart recording
                    if (displaySettings.streamMode==STREAM_RECORD)
                        displaySettings.streamMode=STREAM_REPLAY

                    display.setStreamMode(displaySettings.streamMode);
                }
            }
        }
    }
}


async function writeObjectToFile(obj: DisplaySettingsI): Promise<void> {
    try {
        const data = JSON.stringify(obj, null, 2);
        await fs.writeFile(filePath, data, 'utf-8');
        console.log(`saved settings to ${filePath}`);
    } catch (error) {
        console.error('Error writing to file:', error);
    }
}

async function readObjectFromFile(): Promise<DisplaySettingsI | null> {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const obj: DisplaySettingsI = JSON.parse(data);
        return obj;
    } catch (error) {
        console.error('Error reading settings from file:', error);
        return null;
    }
}
