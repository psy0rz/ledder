// min and max included
import { stat } from "fs/promises";
import $ from "jquery";
import convert from "color-convert"
import {Color} from "./Color.js";

/**
 * Number from min to max (inclusive)
 * @param min
 * @param max
 */
export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function error(title: string, message: string, time = 10000) {
  // @ts-ignore
  $("body").toast({
    class: "error",
    title: title,
    message: message,
    displayTime: time
  });
}

export function info(title: string, message: string = "", time = 2000) {
  // @ts-ignore
  $("body").toast({
    class: "info",
    title: title
    ,
    message: message,
    displayTime: time
  });

}

let loaders = 0;

export function progressStart() {
  loaders++;
  $("#ledder-loader").addClass("active");

}

export function progressDone() {
  loaders--;
  if (!loaders) {
    $("#ledder-loader").removeClass("active");
  }
}

export function progressReset() {
  loaders = 0;
  $("#ledder-loader").removeClass("active");

}

/**
 * Asks user for confirmation, returns Promise
 * @param title
 * @param content
 */
export async function confirmPromise(title: string, content: string) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    $('body').modal('confirm', title, content, async (confirmed) => {
        if (confirmed)
          resolve(confirmed)
        else
          reject(confirmed)
      }
    )
  })
}

/**
 * Asks user for input, returns Promise
 * @param title
 * @param content
 * @param defaultValue
 */
export async function promptPromise(title:string , content:string, defaultValue:string):Promise<string> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    $('body').modal('prompt', {
      title: title,
      content: content,
      defaultValue: defaultValue,
      handler: async name => {
        if (name)
          resolve(name)
        else
          reject(name)
      }
    })
  })
}




//calculate converion table for fire-intensity (0-100) to Color()
export function calculateFireColors() {

  const colors = []
  for (let i = 0; i <= 100; i++) {
    const colorH = Math.round(i * 40 / 100);
    const colorS = 100;
    const colorL = i;
    const rgb = convert.hsl.rgb([colorH, colorS, colorL])
    colors.push(new Color(rgb[0], rgb[1], rgb[2]))
  }
  return (colors)
}
