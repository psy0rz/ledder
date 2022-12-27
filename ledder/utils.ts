//led utils

import {next} from "dom7"

/**
 * Integer number wwith guassian bell curve distribution from min to max (inclusive)
 * from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
 * @param min
 * @param max
 * @param amount Slimness of the distirbution. 1 is uniform random()
 **/
export function randomGaussian(min, max, amount = 3) {
    var rand = 0

    for (var i = 0; i < amount; i += 1) {
        rand += Math.random()
    }

    rand = rand / amount
    return ~~(rand * (max - min + 1) + min)
}


/**
 * Integer number from min to max (inclusive)
 * @param min
 * @param max
 */
export function random(min, max) {
    return ~~(Math.random() * (max - min + 1) + min)

}

/**
 * Floating number from min to max (inclusive min, but never reaches max)
 * @param min
 * @param max
 */
export function randomFloat(min, max) {
    return (Math.random() * (max - min) + min)
}

/**
 * Floating number from min to max (inclusive min, but never reaches max)
 * with guassian bell curve distribution
 * @param min
 * @param max
 * @param amount Slimness of the distirbution. 1 is uniform random()
 */
export function randomFloatGaussian(min, max, amount = 3) {
    var rand = 0

    for (var i = 0; i < amount; i += 1) {
        rand += Math.random()
    }

    rand = rand / amount
    return (rand * (max - min) + min)
}


//check if its a number and in this range or throw error
export function numberCheck(desc, number, min = undefined, max = undefined) {
    if (isNaN(number))
        throw (`${desc}: '${number}' is not a number`)
    if (min !== undefined && number < min)
        throw (`${desc}: is ${number} but should be at least ${min}`)
    if (max !== undefined && number > max)
        throw (`${desc}: is ${number} but should be at most ${max}`)
}

//glow firepixel intesity between min/max (inclusive), with specified "wildness"
//return new value
export function glow(current: number, min: number, max: number, wildness: number, gausian = 3) {

    current = current + randomGaussian(-wildness, wildness, gausian)

    if (current > max)
        current = max
    else if (current < min)
        current = min

    return (current)
}

//https://easings.net/#easeInOutCubic
export function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2
}

export function easeInOutQuad(x: number): number {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

export function easeInOutQuart(x: number): number {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
}

//steps up from 0 to max with stepsize, never reaches max. return floored value
export class ForwardStepper {
    public step: number
    public max: number
    public value: number

    constructor(max, step) {
        this.step = step
        this.max = max
        this.value = 0
    }

    next() {
        this.value = (this.value + this.step) % this.max
        return (~~this.value)
    }
}

export class ReverseStepper {
    public step: number
    public max: number
    public value: number

    constructor(max, step) {
        this.step = step
        this.max = max
        this.value = 0
    }

    next() {
        this.value = (this.value + this.step) % this.max
        return (~~(this.max - 1 - this.value))
    }
}

export class PingPongStepper {
    public step: number
    public max: number
    public value: number

    constructor(max, step) {
        this.step = step
        this.max = max
        this.value = 0
    }

    next() {
        this.value = (this.value + this.step)
        if (this.value >= this.max) {
            this.step = -Math.abs(this.step)
            this.value = this.max + this.step
        } else if (this.value < 0) {
            this.step = Math.abs(this.step)
            this.value =  this.step
        }
        return (~~(this.value))
    }
}
