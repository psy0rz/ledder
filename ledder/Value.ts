import ValueInterface from "./ValueInterface.js";

export  default class Value implements ValueInterface {
    value: number

    constructor(value: number) {
        this.value = value
    }

}
