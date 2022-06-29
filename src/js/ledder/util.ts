//led utils


/**
 * Integer number wwith guassian bell curve distribution from min to max (inclusive)
 * from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
 * @param min
 * @param max
 * @param amount Slimness of the distirbution. 1 is uniform random()
 **/
export function randomGaussian(min, max, amount=3) {
    var rand = 0;

    for (var i = 0; i < amount; i += 1) {
        rand += Math.random();
    }

    rand=rand / amount;
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
export function randomFloatGaussian(min, max, amount=3) {
    var rand = 0;

    for (var i = 0; i < amount; i += 1) {
        rand += Math.random();
    }

    rand=rand / amount;
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
