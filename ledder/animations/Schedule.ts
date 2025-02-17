import PixelBox from "../PixelBox.js"
import Pixel from "../Pixel.js"
import Scheduler from "../Scheduler.js"
import Color from "../Color.js"
import ControlGroup from "../ControlGroup.js"
import Animator from "../Animator.js"
import * as https from "node:https";
import {XMLBuilder, XMLParser} from "fast-xml-parser";


const SCHEDULE_URL = 'https://pretalx.hackerhotel.nl/2025/schedule.xml';


const p = new XMLParser({})

export default class Template extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

// For Node 18+ where fetch is globally available:
        (async () => {
            try {
                const response = await fetch(SCHEDULE_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                const xmlData = await response.text();
                // console.log(xmlData);

                const parser = new XMLParser();
                let jObj = parser.parse(xmlData);

                // const builder = new XMLBuilder();
                // const xmlContent = builder.build(jObj);

                // console.log(jObj.schedule.day)

                for (let day of jObj.schedule.day) {
                    console.log(day)
                    for (let room of day) {
                        for (const event of room) {
                            console.log(event)
                        }
                    }
                }


            } catch (error) {
                console.error('Fetch error:', error);
            }
        })();
    }
}