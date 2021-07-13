export abstract class Rpc {

    /**
     * Add a method
     * @param name Method name
     * @param method Callback function with actual method.
     */
    abstract addMethod(name, method);

    /**
     * Call a method, returns a Promise.
     * @param name Method name
     * @param params Parameters
     */
    abstract request(name, params);

}
