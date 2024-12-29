
export default class CallbackManager<T extends (...args: any[]) => any> {
    private callbacks: Set<T>;

    constructor() {
        this.callbacks = new Set();
    }

    // Register a callback
    register(callback: T): void {
        this.callbacks.add(callback);
    }


    // Unregister a callback
    unregister(callback: T): void {
        this.callbacks.delete(callback);
    }

    // Trigger all registered callbacks
    trigger(...args: Parameters<T>): void {
        for (const callback of this.callbacks) {
            callback(...args);
        }
    }

    // Check if a callback is registered
    isRegistered(callback: T): boolean {
        return this.callbacks.has(callback);
    }
}

