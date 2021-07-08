export abstract class Rpc {

    /**
     * Add a method to the rpc server
     * @param name Method name
     * @param callback Callback function with actual method.
     */
    abstract addMethod(name, callback);

    /**
     * Call a method on the browser side.
     * @param name Method name
     * @param params Parameters
     */
    abstract request(name, params);

}
