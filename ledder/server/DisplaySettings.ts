import {promises as fs} from 'fs';
import * as path from 'path';
import type ControlGroup from "../ControlGroup.js";
import type RenderControl from "./RenderControl.js";
import type {Values} from "../Control.js";

const filePath = 'settings.json';

export interface DisplaySettingsI {
    [key: string]: {
        'animationAndPresetPath': string,
        'settingsControl': Values,
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
        settings[renderControl.getPrimaryDisplay().id] = {
            'animationAndPresetPath': renderControl.selected(),
            'settingsControl': renderControl.getPrimaryDisplay().settingsControl.save(),
        }
    }
    await writeObjectToFile(settings)
}

export async function loadSettings(renderControllers: Array<RenderControl>) {
    const settings = await readObjectFromFile()
    if (settings) {
        for (let renderControl of renderControllers) {
            if (settings[renderControl.getPrimaryDisplay().id] !== undefined) {
                const displaySettings = settings[renderControl.getPrimaryDisplay().id]
                await renderControl.select(displaySettings.animationAndPresetPath, false)
                renderControl.getPrimaryDisplay().settingsControl.load(displaySettings.settingsControl)
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
