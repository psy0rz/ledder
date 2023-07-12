//A normal promise, but now resolve and reject are publicly accessible, so they can be called from anywhere.
//Needed for Scheduler

export default class PublicPromise<T> {
    public resolve: (value: (T | PromiseLike<T>)) => void
    public reject: (reason?: any) => void
    public promise: Promise<T>

    constructor() {


        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject

        })


    }


}