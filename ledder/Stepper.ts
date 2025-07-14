// Stepper class: steps from 0 up to max, wraps around, supports float step values.
// Pingong means the stepper will reverse direction when reaching the max value, and continue from there.
export class Stepper {
    private value: number;
    private readonly max: number;
    private readonly step: number;
    private internalMax: number;

    constructor(max: number, step: number, reverse: boolean, pingpong: boolean) {
        if (reverse)
            this.step = -step;
        else
            this.step=step;


        this.value = 0;
        this.max = max;
        this.internalMax = pingpong ? (max * 2 -1) : max;
    }

    next(): number {

        /**
            max=4
            internalmax=7 (max*2 - 1)
            01234567 01234567 (internal)
            01234321 01234321  (pingponged)

            max=3
            internalMax=5 (max*2 -1)
            012345 012345
            012321 012321
        **/


        this.value = (this.value+this.step);

        //wrap around
        if (this.value<0)
            this.value=this.value+this.internalMax+1
        else if (this.value>this.internalMax)
            this.value=this.value-this.internalMax-1;

        return this.getValue()
    }

    getValue()
    {

        //get value, but now pingpong back if internal value is > max
        if (this.value> this.max) {
            return this.internalMax - this.value+1
        }
        else
            return this.value

    }

    //gets internal value, this can be 2*max in case of pingpong.
    getInternalValue(): number {
        return this.value
    }

    setInternalValue(value: number) {
        this.value=value
    }
}
