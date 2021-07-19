// min and max included
import $ from "jquery";

export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function error(title: string, message: string, time = 10000) {
  // @ts-ignore
  $("body").toast({
    class: "error",
    title: title
    ,
    message: message,
    displayTime: time
  });
}

export function info(title: string, message: string="", time = 2000)
{
  // @ts-ignore
  $("body").toast({
    class: "info",
    title: title
    ,
    message: message,
    displayTime: time
  });

}

let loaders=0;
export function progressStart()
{
  loaders++;
  $("#loader").addClass("active");

}

export function progressDone()
{
  loaders--;
  if (!loaders)
  {
    $("#loader").removeClass("active");
  }
}

export function progressReset()
{
  loaders=0;
  $("#loader").removeClass("active");

}
