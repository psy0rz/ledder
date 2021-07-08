export abstract class Rpc {

    /**
     * Add a method
     * @param name Method name
     * @param callback Callback function with actual method.
     */
    abstract addMethod(name, callback);

    /**
     * Call a method, returns a Promise.
     * @param name Method name
     * @param params Parameters
     */
    abstract request(name, params);

}
